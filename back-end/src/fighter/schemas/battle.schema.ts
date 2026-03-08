import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ _id: false })
export class BattleRound {
    @Prop({ required: true })
    round: number;

    @Prop({ required: true })
    attacker: string;

    @Prop({ required: true })
    defender: string;

    @Prop({ required: true })
    damage: number;

    @Prop({ required: true })
    attackerHp: number;

    @Prop({ required: true })
    defenderHp: number;
}

@Schema({ timestamps: true })
export class Battle extends Document {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    userId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    opponentId: Types.ObjectId;

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
}

export const BattleSchema = SchemaFactory.createForClass(Battle);
