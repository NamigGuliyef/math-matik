import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class UserInventory extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'FighterItem', required: false })
  itemId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Character', required: false })
  characterId: Types.ObjectId;

  @Prop({ default: false })
  isEquipped: boolean;
}

export const UserInventorySchema = SchemaFactory.createForClass(UserInventory);
