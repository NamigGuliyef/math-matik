import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Question extends Document {
  @Prop({ required: true })
  grade: string;

  @Prop({ required: true })
  level: string;

  @Prop({ required: true })
  text: string;

  @Prop({ required: true, type: [String] })
  options: string[];

  @Prop({ required: true })
  correctAnswer: string;

  @Prop({ required: true, default: 0.001 })
  rewardAmount: number;

  @Prop({ required: true, default: 1 })
  stage: number;
}

export const QuestionSchema = SchemaFactory.createForClass(Question);
