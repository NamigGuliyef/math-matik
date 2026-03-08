import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Question } from './schemas/question.schema';
import { User } from '../users/schemas/user.schema';
import { FighterService } from '../fighter/fighter.service';
import { FighterItem } from '../fighter/schemas/fighter-item.schema';
import { UserInventory } from '../fighter/schemas/user-inventory.schema';

@Injectable()
export class QuizService {
    constructor(
        @InjectModel(Question.name) private questionModel: Model<Question>,
        @InjectModel(User.name) private userModel: Model<User>,
        @InjectModel(FighterItem.name) private itemModel: Model<FighterItem>,
        @InjectModel(UserInventory.name) private inventoryModel: Model<UserInventory>,
        private fighterService: FighterService,
    ) { }

    async completeStage(userId: string, levelCap: string, stage: number) {
        const fs = require('fs');
        const logFile = 'quiz_debug.log';
        const log = (msg: string) => {
            try {
                fs.appendFileSync(logFile, `${new Date().toISOString()} - ${msg}\n`);
            } catch (e) { }
            console.log(msg);
        };

        log(`Completing stage: User ${userId}, LevelCap ${levelCap}, Stage ${stage}`);

        const user = await this.userModel.findById(userId);
        if (!user) throw new NotFoundException('İstifadəçi tapılmadı');

        const stageId = `${levelCap.toLowerCase()}:${stage}`;

        // Robust level parsing (level1, Level1, LEVEL1 -> 1)
        const levelMatch = levelCap.match(/\d+/);
        const levelNum = levelMatch ? parseInt(levelMatch[0]) : 1;
        const targetItemLevel = Math.ceil(levelNum / 2);

        const isAlreadyCompleted = user.completedStages.includes(stageId);

        log(`Parsed Level: ${levelNum}, Target Item Level: ${targetItemLevel}, Already Completed: ${isAlreadyCompleted}`);

        if (isAlreadyCompleted) {
            log(`User already completed stage ${stageId}. Skipping reward.`);
            return {
                stageComplete: true,
                message: 'Stage already completed. No new rewards issued.',
                stageId,
                reward: null
            };
        }

        // Find items of appropriate level - STICKING TO SPECIFIC LEVEL (no fallback as requested)
        const suitableItems = await this.itemModel.find({ level: targetItemLevel }).exec();

        log(`Found ${suitableItems.length} suitable items for level ${targetItemLevel}`);

        if (suitableItems.length === 0) {
            log(`WARNING: No items found for level ${targetItemLevel} in the database.`);
            if (!user.completedStages.includes(stageId)) {
                user.completedStages.push(stageId);
                await user.save();
            }
            return {
                stageComplete: true,
                message: 'Stage completed, but no items available for this level.',
                stageId,
                reward: null
            };
        }

        // Pick a random item from the level
        const randomItem = suitableItems[Math.floor(Math.random() * suitableItems.length)];
        const itemId = randomItem._id.toString();

        log(`Selected random item: ${randomItem.name} (${itemId})`);

        // Update progress (5% per chest)
        if (!user.itemProgress) {
            user.itemProgress = new Map();
        }

        const currentProgress = user.itemProgress.get(itemId) || 0;
        let newProgress = currentProgress + 5;
        let itemAwarded = false;

        if (newProgress >= 100) {
            newProgress = 100;

            // Add to inventory
            const newItem = new this.inventoryModel({
                userId: new Types.ObjectId(userId),
                itemId: randomItem._id,
                isEquipped: false,
            });
            await newItem.save();
            itemAwarded = true;
            newProgress = 0; // Reset for next time
        }

        log(`Progress updated: ${currentProgress}% -> ${newProgress}%. Item Awarded: ${itemAwarded}`);

        // Prepare updates for user document
        if (!user.completedStages.includes(stageId)) {
            user.completedStages.push(stageId);
        }

        user.itemProgress.set(itemId, newProgress);
        user.markModified('itemProgress');
        user.markModified('completedStages');

        await user.save();
        log(`Saved user progress successfully.`);

        return {
            stageComplete: true,
            reward: {
                rewardType: 'item_progress',
                itemName: randomItem.name,
                itemImage: randomItem.image,
                addedProgress: 5,
                currentProgress: newProgress === 0 && itemAwarded ? 100 : newProgress,
                itemAwarded,
            }
        };
    }
}
