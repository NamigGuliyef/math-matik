import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StreaksService } from './streaks.service';
import { StreaksController } from './streaks.controller';
import { StreakReward, StreakRewardSchema } from './schemas/streak-reward.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { FighterItem, FighterItemSchema } from '../fighter/schemas/fighter-item.schema';
import { UserInventory, UserInventorySchema } from '../fighter/schemas/user-inventory.schema';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: StreakReward.name, schema: StreakRewardSchema },
      { name: User.name, schema: UserSchema },
      { name: FighterItem.name, schema: FighterItemSchema },
      { name: UserInventory.name, schema: UserInventorySchema },
    ]),
    AuthModule,
  ],
  providers: [StreaksService],
  controllers: [StreaksController],
  exports: [StreaksService],
})
export class StreaksModule {}
