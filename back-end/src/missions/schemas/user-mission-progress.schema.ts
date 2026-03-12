import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class UserMissionProgress extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: string;

  @Prop({ type: Types.ObjectId, required: true })
  targetId: string; // Mission ID or Achievement ID

  @Prop({ required: true, enum: ['mission', 'achievement'] })
  targetType: string;

  @Prop({ default: 0 })
  currentCount: number;

  @Prop({ default: false })
  isClaimed: boolean;

  @Prop({ default: null })
  resetAt: Date; // Only for daily missions
}

export const UserMissionProgressSchema =
  SchemaFactory.createForClass(UserMissionProgress);
