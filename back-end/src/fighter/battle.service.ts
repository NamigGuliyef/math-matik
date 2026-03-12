import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User } from '../users/schemas/user.schema';
import { UserInventory } from './schemas/user-inventory.schema';
import { Battle } from './schemas/battle.schema';
import { MissionsService } from '../missions/missions.service';
import { MissionType } from '../missions/schemas/mission.schema';

@Injectable()
export class BattleService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(UserInventory.name)
    private inventoryModel: Model<UserInventory>,
    @InjectModel(Battle.name) private battleModel: Model<Battle>,
    private readonly missionsService: MissionsService,
  ) {}

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
      kritik_sans: 5, // Base 5%
      qacinma_sansi: 0,
      bloklama_gucu: 0,
      deqiqlik: 0,
    };

    equipped.forEach((record: any) => {
      if (record.itemId && record.itemId.attributes) {
        Object.entries(record.itemId.attributes).forEach(([key, value]) => {
          stats[key] = (stats[key] || 0) + Number(value);
        });
      }
      if (record.characterId) {
        // Character level improves base HP/Damage
        stats.can += record.characterId.level * 10;
        stats.zerbe_gucu += record.characterId.level * 2;
        stats.name = record.characterId.name;
      }
    });

    return stats;
  }

  calculatePower(stats: any) {
    // More comprehensive power calculation
    return (
      (stats.can || 100) +
      (stats.zerbe_gucu || 10) * 3 +
      (stats.mudafie || 0) * 1.5 +
      (stats.zireh_delme || 0) * 1.5 +
      (stats.kritik_sans || 0) * 5 +
      (stats.qacinma_sansi || 0) * 10 +
      (stats.bloklama_gucu || 0) * 5
    );
  }

  async startBattle(userId: string) {
    const userIdObj = new Types.ObjectId(userId);

    // Check if there's an ongoing battle
    const ongoingBattle = await this.battleModel
      .findOne({
        userId: userIdObj,
        status: 'ongoing',
      })
      .exec();

    if (ongoingBattle) {
      return {
        battle: ongoingBattle,
        userStats: ongoingBattle.userStats,
        opponentStats: ongoingBattle.opponentStats,
        opponentName:
          (await this.userModel.findById(ongoingBattle.opponentId))?.name ||
          'Rəqib',
        isResumed: true,
      };
    }

    const userStats = await this.getUserStats(userId);
    const userPower = this.calculatePower(userStats);

    // Find recent opponent to avoid repetition
    const lastBattle = await this.battleModel
      .findOne({ userId: userIdObj })
      .sort({ createdAt: -1 })
      .exec();
    const lastOpponentId = lastBattle?.opponentId;

    // Matchmaking: ±20% power range
    const minPower = userPower * 0.8;
    const maxPower = userPower * 1.2;

    const excludedIds: Types.ObjectId[] = [userIdObj];
    if (lastOpponentId) excludedIds.push(lastOpponentId);

    const potentialOpponents = await this.userModel
      .find({
        _id: { $nin: excludedIds },
      })
      .limit(100)
      .exec();

    const matchedOpponents: {
      user: any;
      stats: Record<string, number>;
      power: number;
    }[] = [];
    for (const opponent of potentialOpponents) {
      const oppStats = await this.getUserStats(opponent._id.toString());
      const oppPower = this.calculatePower(oppStats);
      if (oppPower >= minPower && oppPower <= maxPower) {
        matchedOpponents.push({
          user: opponent,
          stats: oppStats,
          power: oppPower,
        });
      }
    }

    let opponent;
    if (matchedOpponents.length === 0) {
      const fallbackOpponent = await this.userModel
        .findOne({ _id: { $ne: userIdObj } })
        .exec();
      if (!fallbackOpponent) throw new NotFoundException('Rəqib tapılmadı');
      const oppStats = await this.getUserStats(fallbackOpponent._id.toString());
      opponent = {
        user: fallbackOpponent,
        stats: oppStats,
        power: this.calculatePower(oppStats),
      };
    } else {
      opponent =
        matchedOpponents[Math.floor(Math.random() * matchedOpponents.length)];
    }

    const battle = new this.battleModel({
      userId: userIdObj,
      opponentId: opponent.user._id,
      status: 'ongoing',
      playerHp: userStats.can,
      opponentHp: opponent.stats.can,
      maxPlayerHp: userStats.can,
      maxOpponentHp: opponent.stats.can,
      userStats,
      opponentStats: opponent.stats,
      opponentName: opponent.user.name,
      userPower,
      opponentPower: opponent.power,
      rounds: [],
    });

    await battle.save();

    return {
      battle,
      userStats,
      opponentStats: opponent.stats,
      opponentName: opponent.user.name,
      isResumed: false,
    };
  }

  async performAction(battleId: string, userId: string, action: string) {
    const battle = await this.battleModel.findById(battleId).exec();
    if (!battle || battle.status !== 'ongoing') {
      throw new NotFoundException('Döyüş tapılmadı və ya artıq bitib');
    }

    if (battle.userId.toString() !== userId) {
      throw new Error('Bu döyüş sizə aid deyil');
    }

    // Enemy AI Action
    const enemyRand = Math.random();
    let enemyAction = 'attack';
    if (enemyRand < 0.5) enemyAction = 'attack';
    else if (enemyRand < 0.75) enemyAction = 'defend';
    else enemyAction = 'strong_attack';

    const roundNum = battle.rounds.length + 1;
    let log = `⚔ Raund ${roundNum}\n\n`;

    // Execute Player Action
    const pResult = this.calculateTurnDamage(
      action,
      battle.userStats,
      battle.opponentStats,
      enemyAction === 'defend',
      'Sən',
    );
    battle.opponentHp -= pResult.damage;
    log += `${pResult.flavorText}\n`;

    // Execute Enemy Action (if still alive)
    let eResult: any = { damage: 0, flavorText: '', isMiss: true };
    if (battle.opponentHp > 0) {
      eResult = this.calculateTurnDamage(
        enemyAction,
        battle.opponentStats,
        battle.userStats,
        action === 'defend',
        battle.opponentName || 'Rəqib',
      );
      battle.playerHp -= eResult.damage;
      log += `\n${eResult.flavorText}`;
    } else {
      battle.opponentHp = 0;
      log += `\n💀 Rəqib məğlub edildi!`;
    }

    if (battle.playerHp < 0) battle.playerHp = 0;

    const round: any = {
      round: roundNum,
      playerAction: action,
      opponentAction: enemyAction,
      playerDamage: eResult.damage, // damage taken by player
      opponentDamage: pResult.damage, // damage taken by opponent
      playerHpAfter: battle.playerHp,
      opponentHpAfter: battle.opponentHp,
      log,
      metadata: {
        p: {
          isCrit: pResult.isCrit,
          isMiss: pResult.isMiss,
          isDodge: pResult.isDodge,
          isBlock: pResult.isBlock,
        },
        e: {
          isCrit: eResult.isCrit,
          isMiss: eResult.isMiss,
          isDodge: eResult.isDodge,
          isBlock: eResult.isBlock,
        },
      },
    };

    battle.rounds.push(round);

    // Check if finished
    let battleFinished = false;
    if (battle.opponentHp <= 0 || battle.playerHp <= 0) {
      battleFinished = true;
      battle.status = 'finished';

      // Critical Fix: Explicit winnerId assignment
      if (battle.opponentHp <= 0) {
        battle.winnerId = battle.userId;
      } else {
        battle.winnerId = battle.opponentId;
      }

      // Awards
      const winnerAmount = 0.5;
      const loserAmount = 0.1;
      battle.rewards = { winnerAmount, loserAmount };

      const isUserWinner =
        battle.winnerId.toString() === battle.userId.toString();

      // Update balances correctly based on who won
      const userReward = isUserWinner ? winnerAmount : loserAmount;
      const opponentReward = isUserWinner ? loserAmount : winnerAmount;

      const userUpdate: any = { $inc: { balance: userReward } };
      if (isUserWinner) {
        userUpdate.$inc.totalBattlesWon = 1;
      }

      await this.userModel.findByIdAndUpdate(battle.userId, userUpdate);
      await this.userModel.findByIdAndUpdate(battle.opponentId, {
        $inc: { balance: opponentReward },
      });

      if (isUserWinner) {
        await this.missionsService.trackProgress(
          battle.userId.toString(),
          MissionType.BATTLE_WIN,
          1,
        );
      }
    }

    await battle.save();

    return {
      battle,
      round,
      finished: battleFinished,
      winnerId: battle.winnerId,
    };
  }

  private calculateTurnDamage(
    action: string,
    attackerStats: any,
    defenderStats: any,
    isDefending: boolean,
    attackerName: string,
  ) {
    let weaponDamage = attackerStats.zerbe_gucu || 10;
    let hitChance = attackerStats.deqiqlik ? 100 + attackerStats.deqiqlik : 100;
    const actionName =
      action === 'strong_attack'
        ? 'Güclü Hücum'
        : action === 'defend'
          ? 'Müdafiə'
          : 'Hücum';

    let isCrit = false;
    let isMiss = false;
    let isDodge = false;
    let isBlock = false;
    let flavorText = '';

    const isUserAttacker = attackerName === 'Sən';
    const subj = isUserAttacker ? 'Siz' : attackerName;
    const obj = isUserAttacker ? 'Rəqib' : 'Siz';

    // Grammar helpers
    const suffix1 = isUserAttacker ? 'nız' : ''; // aldı/aldınız, etdi/etdiniz
    const suffix2 = isUserAttacker ? 'nız' : ''; // atdı/atdınız
    const isUserDefender = !isUserAttacker;
    const defSuffix = isUserDefender ? 'nız' : ''; // yayındı/yayındınız

    if (action === 'strong_attack') {
      weaponDamage *= 1.5;
      hitChance *= 0.7; // 70% of base hit chance
    } else if (action === 'defend') {
      return {
        damage: 0,
        flavorText: `🛡 ${subj} müdafiə mövqeyi aldı${suffix1}.`,
        isMiss: false,
        isCrit: false,
        isDodge: false,
        isBlock: false,
      };
    }

    // 1. Check Dodge
    const dodgeChance = defenderStats.qacinma_sansi || 0;
    if (Math.random() * 100 < dodgeChance) {
      isDodge = true;
      return {
        damage: 0,
        flavorText: `💨 ${obj} hücumdan yayındı${defSuffix}!`,
        isDodge,
        isCrit,
        isMiss,
        isBlock,
      };
    }

    // 2. Check Hit
    if (Math.random() * 100 > hitChance) {
      isMiss = true;
      return {
        damage: 0,
        flavorText: `❌ ${subj} tərəfindən endirilən ${actionName} boşa çıxdı!`,
        isMiss,
        isCrit,
        isDodge,
        isBlock,
      };
    }

    // 3. Calculate Base Damage
    const effectiveDefense = Math.max(
      0,
      (defenderStats.mudafie || 0) - (attackerStats.zireh_delme || 0),
    );
    let damage = weaponDamage * (100 / (100 + effectiveDefense));

    // 4. Check Block
    if (isDefending) {
      isBlock = true;
      damage *= 0.5;
      flavorText = `🛡 Hücum bloklandı! `;
    }

    // 5. Check Crit
    const critChance = attackerStats.kritik_sans || 5;
    if (Math.random() * 100 < critChance) {
      isCrit = true;
      damage *= 2;
      flavorText += `🔥 KRİTİK ZƏRBƏ! `;
    }

    damage = Math.round(damage * 10) / 10;

    if (action === 'attack') {
      flavorText += `${subj} silaha əl atdı${suffix2}. ${obj} ${damage} zərər aldı${defSuffix}.`;
    } else {
      flavorText += `${subj} ${actionName} etdi${suffix1}. ${obj} ${damage} zərər aldı${defSuffix}.`;
    }

    return { damage, flavorText, isCrit, isMiss, isDodge, isBlock };
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
    const winners = await this.battleModel
      .aggregate([
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
      ])
      .exec();

    return winners;
  }
}
