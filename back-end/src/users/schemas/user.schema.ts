import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum UserRole {
  ADMIN = 'admin',
  STUDENT = 'student',
}

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  surname: string;

  @Prop({ required: true })
  fatherName: string;

  @Prop({ required: true })
  password: string;

  @Prop({ default: UserRole.STUDENT })
  role: UserRole;

  @Prop({ default: 0 })
  balance: number;

  @Prop({ default: 0 })
  correctAnswers: number;

  @Prop({ default: 0 })
  wrongAnswers: number;

  @Prop({ default: 0 })
  totalAnswered: number;

  @Prop({ default: 'level1' })
  level: string;

  @Prop({ type: [String], default: [] })
  answeredQuestions: string[]; // Store IDs of correctly answered questions

  @Prop()
  quizStartTime?: Date;

  @Prop()
  restEndTime?: Date;

  @Prop({ type: Map, of: Number, default: {} })
  levelProgress: Map<string, number>;

  @Prop({ default: 0 })
  sessionWrongAnswers: number;
}

export const UserSchema = SchemaFactory.createForClass(User);
