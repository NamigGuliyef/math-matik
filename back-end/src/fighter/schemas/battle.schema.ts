import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ _id: false })
export class BattleRound {
    @Prop({ required: true })
    round: number;

    @Prop()
    playerAction: string;

    @Prop()
    opponentAction: string;

    @Prop()
    playerDamage: number;

    @Prop()
    opponentDamage: number;

    @Prop()
    playerHpAfter: number;

    @Prop()
    opponentHpAfter: number;

    @Prop()
    log: string;

    @Prop({ type: Object })
    metadata: any;
}

@Schema({ timestamps: true })
export class Battle extends Document {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    userId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    opponentId: Types.ObjectId;

    @Prop({ type: String, default: 'ongoing', enum: ['ongoing', 'finished'] })
    status: string;

    @Prop({ type: Types.ObjectId, ref: 'User' })
    winnerId: Types.ObjectId;

    @Prop({ type: [BattleRound], default: [] })
    rounds: BattleRound[];

    @Prop({ type: Object })
    rewards: {
        winnerAmount: number;
        loserAmount: number;
    };

    @Prop({ default: 0 })
    userPower: number;

    @Prop({ default: 0 })
    opponentPower: number;

    @Prop({ default: 100 })
    playerHp: number;

    @Prop({ default: 100 })
    opponentHp: number;

    @Prop({ default: 100 })
    maxPlayerHp: number;

    @Prop({ default: 100 })
    maxOpponentHp: number;

    @Prop({ type: Object })
    userStats: any;

    @Prop({ type: Object })
    opponentStats: any;

    @Prop()
    opponentName: string;
}

export const BattleSchema = SchemaFactory.createForClass(Battle);
