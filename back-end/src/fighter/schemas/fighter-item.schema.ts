import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum ItemCategory {
    HELMET = 'şlem',
    ARMOR = 'zireh',
    WEAPON = 'silah',
    SHIELD = 'qalxan',
    BOOTS = 'çəkmə',
    NECKLACE = 'boyunbağı',
    PANTS = 'şalvar',
    GLOVES = 'əlcək',
}

@Schema({ timestamps: true })
export class FighterItem extends Document {
    @Prop({ required: true })
    name: string;

    @Prop({ required: true, enum: ItemCategory })
    category: ItemCategory;

    @Prop({ required: true, min: 1, max: 3 })
    level: number;

    @Prop({ required: true, min: 0 })
    price: number;

    @Prop()
    image?: string;
}

export const FighterItemSchema = SchemaFactory.createForClass(FighterItem);
