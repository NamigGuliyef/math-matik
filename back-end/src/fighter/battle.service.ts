import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User } from '../users/schemas/user.schema';
import { UserInventory } from './schemas/user-inventory.schema';
import { Battle } from './schemas/battle.schema';

@Injectable()
export class BattleService {
    constructor(
        @InjectModel(User.name) private userModel: Model<User>,
        @InjectModel(UserInventory.name) private inventoryModel: Model<UserInventory>,
        @InjectModel(Battle.name) private battleModel: Model<Battle>,
    ) { }

    async getUserStats(userId: string) {
        const userIdObj = new Types.ObjectId(userId);
        const equipped = await this.inventoryModel
            .find({ userId: userIdObj, isEquipped: true })
            .populate('itemId')
            .populate('characterId')
            .exec();

        const stats: Record<string, number> = {
            can: 100, // Base HP
            zerbe_gucu: 10, // Base Damage
            mudafie: 0,
            zireh_delme: 0,
        };

        equipped.forEach((item: any) => {
            if (item.itemId && item.itemId.attributes) {
                Object.entries(item.itemId.attributes).forEach(([key, value]) => {
                    if (key in stats) {
                        stats[key] += Number(value);
                    }
                });
            }
        });

        return stats;
    }

    calculatePower(stats: any) {
        // Simple power calculation for matchmaking
        return stats.can + stats.zerbe_gucu * 2 + stats.mudafie + stats.zireh_delme;
    }

    async startBattle(userId: string) {
        const userIdObj = new Types.ObjectId(userId);
        const userStats = await this.getUserStats(userId);
        const userPower = this.calculatePower(userStats);

        // Find recent opponent to avoid repetition
        const lastBattle = await this.battleModel
            .findOne({ userId: userIdObj })
            .sort({ createdAt: -1 })
            .exec();
        const lastOpponentId = lastBattle?.opponentId;

        // Matchmaking: ±20% power range, excluding self and last opponent
        const minPower = userPower * 0.8;
        const maxPower = userPower * 1.2;

        // For MVP, pick from all users excluding self (and last opponent if exists)
        const excludedIds: Types.ObjectId[] = [userIdObj];
        if (lastOpponentId) excludedIds.push(lastOpponentId as Types.ObjectId);

        const potentialOpponents = await this.userModel.find({
            _id: { $nin: excludedIds },
        }).limit(100).exec();

        // Filter and calculate power for potential opponents (this is heavy, but okay for MVP)
        const matchedOpponents: { user: any; stats: Record<string, number>; power: number }[] = [];
        for (const opponent of potentialOpponents) {
            const oppStats = await this.getUserStats(opponent._id.toString());
            const oppPower = this.calculatePower(oppStats);
            if (oppPower >= minPower && oppPower <= maxPower) {
                matchedOpponents.push({ user: opponent, stats: oppStats, power: oppPower });
            }
        }

        let opponent;
        if (matchedOpponents.length === 0) {
            // If no one in range, just pick a random one that isn't self
            const fallbackOpponent = await this.userModel.findOne({ _id: { $ne: userIdObj } }).exec();
            if (!fallbackOpponent) throw new NotFoundException('Rəqib tapılmadı');
            const oppStats = await this.getUserStats(fallbackOpponent._id.toString());
            opponent = { user: fallbackOpponent, stats: oppStats, power: this.calculatePower(oppStats) };
        } else {
            opponent = matchedOpponents[Math.floor(Math.random() * matchedOpponents.length)];
        }

        const battleResult = this.simulateBattle(
            { id: userId, stats: userStats, name: 'Sən' },
            { id: opponent.user._id.toString(), stats: opponent.stats, name: opponent.user.name }
        );

        // Awards
        const winnerAmount = 0.5;
        const loserAmount = 0.1;

        const isUserWinner = battleResult.winnerId === userId;

        // Update balances
        await this.userModel.findByIdAndUpdate(userId, {
            $inc: { balance: isUserWinner ? winnerAmount : loserAmount }
        });
        await this.userModel.findByIdAndUpdate(opponent.user._id, {
            $inc: { balance: isUserWinner ? loserAmount : winnerAmount }
        });

        const battle = new this.battleModel({
            userId: userIdObj,
            opponentId: opponent.user._id,
            winnerId: new Types.ObjectId(battleResult.winnerId),
            rounds: battleResult.rounds,
            rewards: {
                winnerAmount,
                loserAmount
            },
            userPower,
            opponentPower: opponent.power
        });

        await battle.save();

        const updatedUser = await this.userModel.findById(userIdObj).exec();

        return {
            battle,
            userStats,
            opponentStats: opponent.stats,
            opponentName: opponent.user.name,
            isUserWinner: battleResult.winnerId === userId,
            newBalance: updatedUser?.balance ?? 0,
        };
    }

    private simulateBattle(p1: any, p2: any) {
        const rounds: Array<{ round: number; attacker: string; defender: string; damage: number; attackerHp: number; defenderHp: number }> = [];
        let h1 = p1.stats.can;
        let h2 = p2.stats.can;
        let roundNum = 1;

        while (h1 > 0 && h2 > 0 && roundNum <= 50) {
            // P1 attacks P2
            const d1 = this.calculateDamage(p1.stats, p2.stats);
            h2 -= d1;
            if (h2 < 0) h2 = 0;
            rounds.push({
                round: roundNum,
                attacker: p1.name,
                defender: p2.name,
                damage: Math.round(d1 * 10) / 10,
                attackerHp: Math.round(h1 * 10) / 10,
                defenderHp: Math.round(h2 * 10) / 10
            });

            if (h2 <= 0) break;

            // P2 attacks P1
            const d2 = this.calculateDamage(p2.stats, p1.stats);
            h1 -= d2;
            if (h1 < 0) h1 = 0;
            rounds.push({
                round: roundNum,
                attacker: p2.name,
                defender: p1.name,
                damage: Math.round(d2 * 10) / 10,
                attackerHp: Math.round(h2 * 10) / 10,
                defenderHp: Math.round(h1 * 10) / 10
            });

            roundNum++;
        }

        return {
            winnerId: h1 > 0 ? p1.id : p2.id,
            rounds
        };
    }

    private calculateDamage(attackerStats: any, defenderStats: any) {
        const effectiveDefense = Math.max(0, defenderStats.mudafie - attackerStats.zireh_delme);
        const damage = attackerStats.zerbe_gucu * (100 / (100 + effectiveDefense));
        return damage;
    }

    async getRecentBattle(userId: string) {
        return this.battleModel
            .findOne({ userId: new Types.ObjectId(userId) })
            .sort({ createdAt: -1 })
            .populate('opponentId', 'name surname')
            .exec();
    }

    async getBattleLeaderboard() {
        // Aggregate battles by winnerId, count wins, top 20
        const winners = await this.battleModel.aggregate([
            { $group: { _id: '$winnerId', wins: { $sum: 1 } } },
            { $sort: { wins: -1 } },
            { $limit: 20 },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'user',
                },
            },
            { $unwind: '$user' },
            {
                $project: {
                    _id: 1,
                    wins: 1,
                    name: '$user.name',
                    surname: '$user.surname',
                    fatherName: '$user.fatherName',
                    level: '$user.level',
                },
            },
        ]).exec();

        return winners;
    }
}
