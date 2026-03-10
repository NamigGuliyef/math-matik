import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum MissionType {
    QUIZ_ANSWER = 'quiz_answer',
    BATTLE_WIN = 'battle_win',
    STAGE_COMPLETE = 'stage_complete',
    CHEST_OPEN = 'chest_open',
}

export enum RewardType {
    AZN = 'azn',
    CHEST = 'chest',
}

@Schema({ timestamps: true })
export class Mission extends Document {
    @Prop({ required: true })
    title: string;

    @Prop({ required: true })
    description: string;

    @Prop({ required: true, enum: MissionType })
    type: MissionType;

    @Prop({ required: true, default: 1 })
    targetCount: number;

    @Prop({ required: true, enum: RewardType })
    rewardType: RewardType;

    @Prop({ required: true, default: 0 })
    rewardValue: number;

    @Prop({ default: true })
    isActive: boolean;
}

export const MissionSchema = SchemaFactory.createForClass(Mission);
