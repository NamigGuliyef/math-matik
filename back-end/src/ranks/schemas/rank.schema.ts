import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Rank extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, default: 0 })
  minQuestions: number;

  @Prop({ required: true, default: 'Star' })
  icon: string; // Lucide icon name

  @Prop({ required: true, default: 0 })
  order: number;
}

export const RankSchema = SchemaFactory.createForClass(Rank);
