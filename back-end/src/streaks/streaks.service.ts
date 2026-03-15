import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { StreakReward, StreakType } from './schemas/streak-reward.schema';
import { User } from '../users/schemas/user.schema';
import { FighterItem } from '../fighter/schemas/fighter-item.schema';
import { UserInventory } from '../fighter/schemas/user-inventory.schema';

@Injectable()
export class StreaksService {
  constructor(
    @InjectModel(StreakReward.name) private streakRewardModel: Model<StreakReward>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(FighterItem.name) private itemModel: Model<FighterItem>,
    @InjectModel(UserInventory.name) private inventoryModel: Model<UserInventory>,
  ) {}

  // --- Core Streak Logic ---

  async logActivity(userId: string, type: StreakType, isSuccess: boolean): Promise<{ rewardedMilestones: any[], newStreak: number } | null> {
    const user = await this.userModel.findById(userId);
    if (!user) return null;

    let updates: any = {};
    const now = new Date();
    // Use local time assuming offset +04:00 (Baku time) to match frontend 'today' logic
    now.setHours(now.getHours() + 4);
    const todayStr = now.toISOString().split('T')[0];

    // Initialize map if it doesn't exist
    if (!user.claimedStreakMilestones) {
      user.claimedStreakMilestones = new Map();
    }

    // Process Daily Streak
    if (type === 'daily') {
      if (user.lastStreakActivityDate === todayStr) {
        // Already active today, do nothing for daily streak
      } else if (user.lastStreakActivityDate) {
        // Check if yesterday
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        if (user.lastStreakActivityDate === yesterdayStr) {
          updates.currentDailyStreak = user.currentDailyStreak + 1;
        } else {
          updates.currentDailyStreak = 1;
          updates['claimedStreakMilestones.daily'] = 0; // Reset claimed daily rewards on streak loss
        }
        updates.lastStreakActivityDate = todayStr;
      } else {
        updates.currentDailyStreak = 1;
        updates.lastStreakActivityDate = todayStr;
      }
    } 
    // Process Question Streak
    else if (type === 'question') {
      if (isSuccess) {
        updates.currentQuestionStreak = user.currentQuestionStreak + 1;
      } else {
        updates.currentQuestionStreak = 0;
        updates['claimedStreakMilestones.question'] = 0; // Reset claimed question rewards on string loss
      }
    }
    // Process Stage Streak
    else if (type === 'stage') {
      if (isSuccess) {
        updates.currentStageStreak = user.currentStageStreak + 1;
      } else {
        updates.currentStageStreak = 0; // if we ever add stage failing logic
        updates['claimedStreakMilestones.stage'] = 0;
      }
    }
    // Process Battle Streak
    else if (type === 'battle') {
      if (isSuccess) {
        updates.currentBattleStreak = user.currentBattleStreak + 1;
      } else {
        updates.currentBattleStreak = 0;
        updates['claimedStreakMilestones.battle'] = 0; // Reset claimed battle rewards
      }
    }

    // Apply updates and check rewards
    if (Object.keys(updates).length > 0) {
      // Need to use findByIdAndUpdate to process map updates correctly if using dot notation
      const newStreakVal = updates[`current${type.charAt(0).toUpperCase() + type.slice(1)}Streak`] || 0;
      const claimedBefore = user.claimedStreakMilestones.get(type) || 0;

      // Check for rewards
      const rewardsGiven = await this.checkAndGrantRewards(user, type, newStreakVal, claimedBefore);

      if (rewardsGiven.length > 0) {
         updates[`claimedStreakMilestones.${type}`] = newStreakVal;
         
         // Apply reward increments
         for (const r of rewardsGiven) {
            if (r.rewardAzn > 0) {
               updates.$inc = updates.$inc || {};
               updates.$inc.balance = (updates.$inc.balance || 0) + r.rewardAzn;
            }
            if (r.rewardChest > 0) {
               updates.$inc = updates.$inc || {};
               updates.$inc.chests = (updates.$inc.chests || 0) + r.rewardChest;
            }
         }
      }

      const updatedUser = await this.userModel.findByIdAndUpdate(userId, { $set: updates }, { new: true }).exec();
      return { rewardedMilestones: rewardsGiven, newStreak: newStreakVal };
    }

    return null;
  }

  private async checkAndGrantRewards(user: User, type: StreakType, currentStreak: number, maxClaimed: number): Promise<any[]> {
    if (currentStreak === 0 || currentStreak <= maxClaimed) return [];

    const milestones = await this.streakRewardModel.find({
      type,
      requirement: { $gt: maxClaimed, $lte: currentStreak }
    }).sort({ requirement: 1 }).exec();

    const granted: any[] = [];

    for (const milestone of milestones) {
      const rewardDetail: {
        requirement: number;
        rewardAzn: number;
        rewardChest: number;
        itemAwarded: boolean;
        itemName: string | null;
      } = {
        requirement: milestone.requirement,
        rewardAzn: milestone.rewardAzn,
        rewardChest: milestone.rewardChest,
        itemAwarded: false,
        itemName: null,
      };

      if (milestone.rewardItemProgress > 0) {
         // Logic to grant specific item progress
         const suitableItems = await this.itemModel.find().exec();
         if (suitableItems.length > 0) {
            const userInventory = await this.inventoryModel.find({ userId: user._id }).exec();
            const ownedItemIds = userInventory.map((i) => i.itemId?.toString()).filter((id) => !!id);
            let pool = suitableItems.filter((item) => !ownedItemIds.includes(item._id.toString()));
            if (pool.length === 0) pool = suitableItems;
            
            const randomItem = pool[Math.floor(Math.random() * pool.length)];
            const itemId = randomItem._id.toString();

            if (!user.itemProgress) user.itemProgress = new Map();
            const currentProgress = user.itemProgress.get(itemId) || 0;
            let newProgress = currentProgress + milestone.rewardItemProgress;

            if (newProgress >= 100) {
              newProgress = 100;
              const newItem = new this.inventoryModel({
                userId: user._id,
                itemId: randomItem._id,
                isEquipped: false,
              });
              await newItem.save();
              rewardDetail.itemAwarded = true;
              rewardDetail.itemName = randomItem.name;
              newProgress = 0;
            }
            user.itemProgress.set(itemId, newProgress);
            user.markModified('itemProgress');
            await user.save();
         }
      }

      granted.push(rewardDetail);
    }

    return granted;
  }

  // --- Admin Methods ---

  async getAdminRewards(): Promise<StreakReward[]> {
    return this.streakRewardModel.find().sort({ type: 1, requirement: 1 }).exec();
  }

  async createReward(data: Partial<StreakReward>): Promise<StreakReward> {
    const existing = await this.streakRewardModel.findOne({ type: data.type, requirement: data.requirement });
    if (existing) {
      throw new Error('A reward for this type and requirement already exists');
    }
    const created = new this.streakRewardModel(data);
    return created.save();
  }

  async deleteReward(id: string): Promise<any> {
    return this.streakRewardModel.findByIdAndDelete(id);
  }

  async updateReward(id: string, data: Partial<StreakReward>): Promise<StreakReward | null> {
    const existing = await this.streakRewardModel.findOne({ 
      type: data.type, 
      requirement: data.requirement, 
      _id: { $ne: id } 
    });
    if (existing) {
      throw new Error('A reward for this type and requirement already exists');
    }
    return this.streakRewardModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  // --- User Methods ---
  async getMyStreaks(userId: string): Promise<any> {
    const user = await this.userModel.findById(userId);
    if (!user) return null;

    // Get upcoming milestones
    const types: StreakType[] = ['daily', 'question', 'stage', 'battle'];
    const upcoming: any = {};

    for (const type of types) {
      const currentStreak = user[`current${type.charAt(0).toUpperCase() + type.slice(1)}Streak`] as number;
      const nextMilestone = await this.streakRewardModel.findOne({ type, requirement: { $gt: currentStreak } }).sort({ requirement: 1 }).exec();
      upcoming[type] = nextMilestone;
    }

    return {
      currentDailyStreak: user.currentDailyStreak,
      currentQuestionStreak: user.currentQuestionStreak,
      currentStageStreak: user.currentStageStreak,
      currentBattleStreak: user.currentBattleStreak,
      upcomingMilestones: upcoming
    };
  }
}
