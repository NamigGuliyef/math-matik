import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { MissionType, RewardType } from './mission.schema';

@Schema({ timestamps: true })
export class Achievement extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true, enum: MissionType })
  type: MissionType;

  @Prop({ required: true, default: 1 })
  targetCount: number;

  @Prop({ required: true, enum: RewardType })
  rewardType: RewardType;

  @Prop({ required: true, default: 0 })
  rewardValue: number;

  @Prop({ default: true })
  isActive: boolean;
}

export const AchievementSchema = SchemaFactory.createForClass(Achievement);
