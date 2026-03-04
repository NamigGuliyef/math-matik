import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Character extends Document {
    @Prop({ required: true })
    name: string;

    @Prop({ required: true })
    image: string;

    @Prop({ required: true, min: 1 })
    level: number;
    @Prop({ required: true, min: 0 })
    price: number;
}

export const CharacterSchema = SchemaFactory.createForClass(Character);
