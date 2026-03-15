import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type DailyQuizDocument = DailyQuiz & Document;

@Schema({ timestamps: true })
export class DailyQuiz {
  @Prop({ required: true })
  date: string; // Format: YYYY-MM-DD

  @Prop({ required: true })
  grade: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Question' }], required: true })
  questions: Types.ObjectId[];

  @Prop({ required: true, enum: ['manual', 'random'] })
  selectionMethod: string;

  @Prop({ required: true, default: 0 })
  rewardAzn: number;

  @Prop({ required: true, default: 0 })
  rewardChest: number;
}

export const DailyQuizSchema = SchemaFactory.createForClass(DailyQuiz);

// Unique compound index on date and grade
DailyQuizSchema.index({ date: 1, grade: 1 }, { unique: true });
