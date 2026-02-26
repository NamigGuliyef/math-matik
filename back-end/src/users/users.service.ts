import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserRole } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) { }

  async create(userData: any): Promise<User> {
    const newUser = new this.userModel(userData);
    return newUser.save();
  }

  async findOneByNameAndFatherName(
    name: string,
    surname: string,
    fatherName: string,
  ): Promise<User | null> {
    return this.userModel.findOne({ name, surname, fatherName }).exec();
  }

  async findById(id: string): Promise<User | null> {
    return this.userModel.findById(id).exec();
  }

  async updateStats(id: string, stats: any): Promise<User | null> {
    return this.userModel
      .findByIdAndUpdate(id, { $set: stats }, { new: true })
      .exec();
  }

  async startQuiz(userId: string): Promise<User | null> {
    const user = await this.userModel.findById(userId);
    if (!user) return null;

    const now = new Date();
    const updates: any = {};

    // 1. Check if rest period has expired
    if (user.restEndTime && now >= user.restEndTime) {
      updates.restEndTime = null;
    }

    // 2. Check if a new session should start or rest should be enforced
    const isCurrentlyResting = user.restEndTime && now < user.restEndTime;

    if (!isCurrentlyResting) {
      if (!user.quizStartTime) {
        // No active session — start a new one
        updates.quizStartTime = now;
      } else {
        const elapsed = now.getTime() - user.quizStartTime.getTime();
        if (elapsed > 20 * 60 * 1000) {
          // 20 min passed but restEndTime was never set (timer expired client-side)
          // Enforce rest period now instead of starting a new session
          updates.restEndTime = new Date(now.getTime() + 60 * 60 * 1000);
          updates.quizStartTime = null;
        }
        // If time hasn't expired yet, keep the existing session (do nothing)
      }
    }

    if (Object.keys(updates).length > 0) {
      return this.userModel
        .findByIdAndUpdate(userId, { $set: updates }, { new: true })
        .exec();
    }

    return user;
  }

  async addAnsweredQuestion(
    userId: string,
    questionId: string,
    isCorrect: boolean,
    reward: number,
    level: string,
    index: number,
  ): Promise<{ user: User; addedReward: number; error?: string } | null> {
    const user = await this.userModel.findById(userId);
    if (!user) return null;

    const now = new Date();

    // Check if in rest period
    if (user.restEndTime) {
      if (now < user.restEndTime) {
        return { user, addedReward: 0, error: 'REST_PERIOD' };
      } else {
        // Rest period expired, clear it
        user.restEndTime = undefined;
      }
    }

    // Initialize quiz start time if not set
    let quizStartTime = user.quizStartTime;
    if (!quizStartTime) {
      quizStartTime = now;
    }

    // Check if 20 minutes passed
    const diffMs = now.getTime() - quizStartTime.getTime();
    const diffMins = diffMs / (1000 * 60);

    if (diffMins >= 20) {
      const restEndTime = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour rest
      const updatedUser = await this.userModel
        .findByIdAndUpdate(
          userId,
          {
            $set: {
              restEndTime,
              quizStartTime: null,
              [`levelProgress.${level}`]: index,
            },
          },
          { new: true },
        )
        .exec();
      return { user: updatedUser!, addedReward: 0, error: 'TIME_UP' };
    }

    const query: any = {
      $inc: { totalAnswered: 1 },
      $set: {
        quizStartTime,
      },
    };
    let addedReward = 0;

    if (isCorrect) {
      query.$inc.correctAnswers = 1;
      query.$set[`levelProgress.${level}`] = index;
      if (!user.answeredQuestions.includes(questionId)) {
        if (!query.$push) query.$push = {};
        query.$push.answeredQuestions = questionId;
        query.$inc.balance = reward;
        addedReward = reward;
      }
    } else {
      query.$inc.wrongAnswers = 1;
    }

    const updatedUser = await this.userModel
      .findByIdAndUpdate(userId, query, { new: true })
      .exec();
    return updatedUser ? { user: updatedUser, addedReward } : null;
  }

  async getQuizStatus(userId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) return null;
    return {
      quizStartTime: user.quizStartTime,
      restEndTime: user.restEndTime,
      levelProgress: user.levelProgress,
    };
  }

  async getLeaderboard() {
    return this.userModel
      .find({ role: UserRole.STUDENT })
      .select('name surname fatherName balance level correctAnswers')
      .sort({ correctAnswers: -1 })
      .limit(50)
      .exec();
  }
}
