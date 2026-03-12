import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum ChatMessageType {
  USER = 'user',
  SYSTEM = 'system',
}

@Schema({ timestamps: true })
export class ChatMessage extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  userId?: Types.ObjectId;

  @Prop({ required: true })
  username: string;

  @Prop({ required: true, maxlength: 100 })
  message: string;

  @Prop({
    required: true,
    enum: ChatMessageType,
    default: ChatMessageType.USER,
  })
  type: ChatMessageType;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const ChatMessageSchema = SchemaFactory.createForClass(ChatMessage);
ChatMessageSchema.index({ createdAt: -1 });
