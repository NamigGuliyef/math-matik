import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Mission, MissionType, RewardType } from './schemas/mission.schema';
import { Achievement } from './schemas/achievement.schema';
import { ChestReward, ChestRewardType } from './schemas/chest-reward.schema';
import { UserMissionProgress } from './schemas/user-mission-progress.schema';
import { User } from '../users/schemas/user.schema';
import { FighterItem } from '../fighter/schemas/fighter-item.schema';
import { UserInventory } from '../fighter/schemas/user-inventory.schema';

@Injectable()
export class MissionsService {
    private readonly logger = new Logger(MissionsService.name);

    constructor(
        @InjectModel(Mission.name) private missionModel: Model<Mission>,
        @InjectModel(Achievement.name) private achievementModel: Model<Achievement>,
        @InjectModel(ChestReward.name) private chestRewardModel: Model<ChestReward>,
        @InjectModel(UserMissionProgress.name) private progressModel: Model<UserMissionProgress>,
        @InjectModel(User.name) private userModel: Model<User>,
        @InjectModel(FighterItem.name) private itemModel: Model<FighterItem>,
        @InjectModel(UserInventory.name) private inventoryModel: Model<UserInventory>,
    ) { }

    async trackProgress(userId: string, type: MissionType, increment: number = 1) {
        // 1. Update Daily Missions Progress
        const activeMissions = await this.missionModel.find({ type, isActive: true }).exec();
        for (const mission of activeMissions) {
            await this.updateProgress(userId, mission._id.toString(), 'mission', increment);
        }

        // 2. Update Achievements Progress
        const activeAchievements = await this.achievementModel.find({ type, isActive: true }).exec();
        for (const achievement of activeAchievements) {
            await this.updateProgress(userId, achievement._id.toString(), 'achievement', increment);
        }
    }

    private async updateProgress(userId: string, targetId: string, targetType: 'mission' | 'achievement', increment: number) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let progress = await this.progressModel.findOne({
            userId,
            targetId,
            targetType,
        }).exec();

        if (targetType === 'mission') {
            // Handle daily reset logic here or rely on cron to clear
            if (progress && progress.resetAt && progress.resetAt < today) {
                progress.currentCount = 0;
                progress.isClaimed = false;
                progress.resetAt = today;
            }
        }

        if (!progress) {
            progress = new this.progressModel({
                userId,
                targetId,
                targetType,
                currentCount: 0,
                resetAt: targetType === 'mission' ? today : null,
            });
        }

        progress.currentCount += increment;
        await progress.save();
    }

    async getPlayerMissions(userId: string) {
        const [missions, achievements, progresses] = await Promise.all([
            this.missionModel.find({ isActive: true }).exec(),
            this.achievementModel.find({ isActive: true }).exec(),
            this.progressModel.find({ userId }).exec(),
        ]);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const progressMap = new Map();
        for (const p of progresses) {
            if (p.targetType === 'mission' && p.resetAt && p.resetAt < today) {
                p.currentCount = 0;
                p.isClaimed = false;
                p.resetAt = today;
                await p.save();
            }
            progressMap.set(p.targetId.toString(), p);
        }

        return {
            daily: missions.map(m => {
                const p = progressMap.get(m._id.toString());
                return {
                    ...m.toObject(),
                    currentCount: p ? p.currentCount : 0,
                    isClaimed: p ? p.isClaimed : false,
                };
            }),
            achievements: achievements.map(a => {
                const p = progressMap.get(a._id.toString());
                return {
                    ...a.toObject(),
                    currentCount: p ? p.currentCount : 0,
                    isClaimed: p ? p.isClaimed : false,
                };
            }),
        };
    }

    async claimReward(userId: string, targetId: string) {
        const progress = await this.progressModel.findOne({ userId, targetId }).exec();
        if (!progress || progress.isClaimed) {
            throw new Error('Reward already claimed or mission not found');
        }

        let target: any = await this.missionModel.findById(targetId).exec();
        if (!target) {
            target = await this.achievementModel.findById(targetId).exec();
        }

        if (!target || progress.currentCount < target.targetCount) {
            throw new Error('Mission not completed');
        }

        // Award user
        const update: any = {};
        if (target.rewardType === RewardType.AZN) {
            update.$inc = { balance: target.rewardValue };
        } else if (target.rewardType === RewardType.CHEST) {
            update.$inc = { chests: 1 };
        }

        await this.userModel.findByIdAndUpdate(userId, update).exec();
        progress.isClaimed = true;
        await progress.save();

        return { success: true, rewardType: target.rewardType, rewardValue: target.rewardValue };
    }

    async openChest(userId: string) {
        const user = await this.userModel.findById(userId).exec();
        if (!user || user.chests <= 0) {
            throw new Error('No chests available');
        }

        const rewards = await this.chestRewardModel.find({ isActive: true }).exec();
        if (rewards.length === 0) {
            throw new Error('No rewards configured in pool');
        }

        const reward = rewards[Math.floor(Math.random() * rewards.length)];

        // Deduct chest
        user.chests -= 1;
        user.totalChestsOpened += 1;

        let result: any = { type: reward.type };

        if (reward.type === ChestRewardType.AZN) {
            user.balance += reward.amount;
            result.amount = reward.amount;
        } else if (reward.type === ChestRewardType.ITEM_PROGRESS) {
            if (!user.itemProgress) user.itemProgress = new Map();
            const current = user.itemProgress.get(reward.itemId) || 0;
            let next = current + reward.amount;

            if (next >= 100) {
                // Award item
                const inventory = new this.inventoryModel({
                    userId: user._id,
                    itemId: reward.itemId,
                    isEquipped: false,
                });
                await inventory.save();
                next = 0; // Reset or logic? User requested 100% adds to inventory
                result.itemAwarded = true;
            }
            user.itemProgress.set(reward.itemId, next);
            user.markModified('itemProgress');
            result.progress = reward.amount;
            result.itemId = reward.itemId;

            // Get item name for UI
            const item = await this.itemModel.findById(reward.itemId).exec();
            result.itemName = item?.name;
            result.itemImage = item?.image;
        }

        await user.save();
        return result;
    }
}
