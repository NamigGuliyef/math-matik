import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type StreakType = 'daily' | 'question' | 'stage' | 'battle';

@Schema({ timestamps: true })
export class StreakReward extends Document {
  @Prop({ required: true, enum: ['daily', 'question', 'stage', 'battle'] })
  type: StreakType;

  @Prop({ required: true })
  requirement: number;

  @Prop({ default: 0 })
  rewardAzn: number;

  @Prop({ default: 0 })
  rewardChest: number;

  @Prop({ default: 0 })
  rewardItemProgress: number; // Award specific % progress
}

export const StreakRewardSchema = SchemaFactory.createForClass(StreakReward);
