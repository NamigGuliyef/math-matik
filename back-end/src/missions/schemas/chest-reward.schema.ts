import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum ChestRewardType {
    AZN = 'azn',
    ITEM_PROGRESS = 'item_progress',
}

@Schema({ timestamps: true })
export class ChestReward extends Document {
    @Prop({ required: true, enum: ChestRewardType })
    type: ChestRewardType;

    @Prop({ default: 0 })
    amount: number; // For AZN or Progress %

    @Prop({ type: String, ref: 'FighterItem', required: false })
    itemId: string;

    @Prop({ default: true })
    isActive: boolean;
}

export const ChestRewardSchema = SchemaFactory.createForClass(ChestReward);
