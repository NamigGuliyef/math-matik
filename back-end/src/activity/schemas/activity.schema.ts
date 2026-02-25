import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum ActivityType {
  ANSWER_CORRECT = 'answer_correct',
  ANSWER_WRONG = 'answer_wrong',
  LOGIN = 'login',
  REGISTER = 'register',
}

@Schema({ timestamps: true })
export class Activity extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  userName: string;

  @Prop({ required: true, enum: ActivityType })
  type: ActivityType;

  @Prop({ required: true })
  description: string;
}

export const ActivitySchema = SchemaFactory.createForClass(Activity);
