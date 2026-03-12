import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MissionsService } from './missions.service';
import { MissionsController } from './missions.controller';
import { AdminMissionsController } from './admin-missions.controller';
import { Mission, MissionSchema } from './schemas/mission.schema';
import { Achievement, AchievementSchema } from './schemas/achievement.schema';
import { ChestReward, ChestRewardSchema } from './schemas/chest-reward.schema';
import {
  UserMissionProgress,
  UserMissionProgressSchema,
} from './schemas/user-mission-progress.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import {
  FighterItem,
  FighterItemSchema,
} from '../fighter/schemas/fighter-item.schema';
import {
  UserInventory,
  UserInventorySchema,
} from '../fighter/schemas/user-inventory.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Mission.name, schema: MissionSchema },
      { name: Achievement.name, schema: AchievementSchema },
      { name: ChestReward.name, schema: ChestRewardSchema },
      { name: UserMissionProgress.name, schema: UserMissionProgressSchema },
      { name: User.name, schema: UserSchema },
      { name: FighterItem.name, schema: FighterItemSchema },
      { name: UserInventory.name, schema: UserInventorySchema },
    ]),
  ],
  controllers: [MissionsController, AdminMissionsController],
  providers: [MissionsService],
  exports: [MissionsService],
})
export class MissionsModule {}
