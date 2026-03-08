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

  async startQuiz(userId: string, level: string): Promise<User | null> {
    const user = await this.userModel.findById(userId);
    if (!user) return null;

    const now = new Date();
    const updates: any = {};

    // Use default values for maps if they don't exist
    const quizStartTimes = user.quizStartTimes || new Map();
    const restEndTimes = user.restEndTimes || new Map();

    const currentQuizStartTime = quizStartTimes.get(level);
    const currentRestEndTime = restEndTimes.get(level);

    // 1. Check if rest period for this level has expired
    if (currentRestEndTime && now >= currentRestEndTime) {
      updates[`restEndTimes.${level}`] = null;
    }

    // 2. Check if a new session should start or rest should be enforced
    const isCurrentlyResting = currentRestEndTime && now < currentRestEndTime;

    if (!isCurrentlyResting) {
      if (!currentQuizStartTime) {
        // No active session for this level — start a new one
        updates[`quizStartTimes.${level}`] = now;
        updates[`levelSessionWrongAnswers.${level}`] = 0;
      } else {
        const quizDuration = 20 * 60 * 1000;
        const restDuration = 60 * 60 * 1000;
        const elapsed = now.getTime() - currentQuizStartTime.getTime();

        if (elapsed > quizDuration) {
          // Session expired. Calculate when rest SHOULD end for this level.
          const scheduledRestEnd = new Date(currentQuizStartTime.getTime() + quizDuration + restDuration);

          if (now < scheduledRestEnd) {
            // Still in the calculated rest period
            updates[`restEndTimes.${level}`] = scheduledRestEnd;
            updates[`quizStartTimes.${level}`] = null;
          } else {
            // Rest period also expired — allow starting a new session immediately
            updates[`quizStartTimes.${level}`] = now;
            updates[`levelSessionWrongAnswers.${level}`] = 0;
            updates[`restEndTimes.${level}`] = null;
          }
        }
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
    body: any,
  ): Promise<{ user: User; addedReward: number; error?: string } | null> {
    const user = await this.userModel.findById(userId);
    if (!user) return null;

    const now = new Date();
    const restEndTimes = user.restEndTimes || new Map();
    const currentRestEndTime = restEndTimes.get(level);

    // Check if in rest period for this level
    if (currentRestEndTime) {
      if (now < currentRestEndTime) {
        return { user, addedReward: 0, error: 'REST_PERIOD' };
      }
    }

    // Initialize level-specific quiz start time if not set
    const quizStartTimes = user.quizStartTimes || new Map();
    let currentQuizStartTime = quizStartTimes.get(level);
    if (!currentQuizStartTime) {
      currentQuizStartTime = now;
    }

    // Check if 20 minutes passed for this level
    const diffMs = now.getTime() - currentQuizStartTime.getTime();
    const diffMins = diffMs / (1000 * 60);

    if (diffMins >= 20) {
      const quizDuration = 20 * 60 * 1000;
      const restDuration = 60 * 60 * 1000;
      // Calculate rest end relative to when the quiz SHOULD have ended
      const restEndTime = new Date(currentQuizStartTime.getTime() + quizDuration + restDuration);

      const updatedUser = await this.userModel
        .findByIdAndUpdate(
          userId,
          {
            $set: {
              [`restEndTimes.${level}`]: restEndTime,
              [`quizStartTimes.${level}`]: null,
              [`levelProgress.${level}`]: index,
              [`levelSessionWrongAnswers.${level}`]: 0,
            },
          },
          { new: true },
        )
        .exec();
      return { user: updatedUser!, addedReward: 0, error: 'TIME_UP' };
    }

    // Check if chances are already gone for this level
    const levelSessionWrongAnswers = user.levelSessionWrongAnswers || new Map();
    const currentWrongAnswers = levelSessionWrongAnswers.get(level) || 0;

    if (currentWrongAnswers >= 5) {
      const restEndTime = new Date(now.getTime() + 60 * 60 * 1000);
      const updatedUser = await this.userModel
        .findByIdAndUpdate(
          userId,
          {
            $set: {
              [`restEndTimes.${level}`]: restEndTime,
              [`quizStartTimes.${level}`]: null,
              [`levelSessionWrongAnswers.${level}`]: 0,
            },
          },
          { new: true },
        )
        .exec();
      return { user: updatedUser!, addedReward: 0, error: 'OUT_OF_CHANCES' };
    }

    const query: any = {
      $inc: { totalAnswered: 1 },
      $set: {
        [`quizStartTimes.${level}`]: currentQuizStartTime,
      },
    };
    let addedReward = 0;

    if (isCorrect) {
      query.$set[`levelProgress.${level}`] = index;
      if (body.stage) {
        query.$set[`stageProgress.${level}:${body.stage}`] = index;
      }
      if (!user.answeredQuestions.includes(questionId)) {
        if (!query.$push) query.$push = {};
        query.$push.answeredQuestions = questionId;
        query.$inc.balance = reward;
        query.$inc.correctAnswers = 1;
        addedReward = reward;
      }
    } else {
      query.$inc.wrongAnswers = 1;

      // Check if this was the 5th mistake
      if (currentWrongAnswers + 1 >= 5) {
        const restEndTime = new Date(now.getTime() + 60 * 60 * 1000);
        query.$set[`restEndTimes.${level}`] = restEndTime;
        query.$set[`quizStartTimes.${level}`] = null;
        query.$set[`levelSessionWrongAnswers.${level}`] = 0;
      } else {
        query.$inc[`levelSessionWrongAnswers.${level}`] = 1;
      }
    }

    const updatedUser = await this.userModel
      .findByIdAndUpdate(userId, query, { new: true })
      .exec();

    if (updatedUser) {
      const updatedRestTimes = updatedUser.restEndTimes || new Map();
      if (updatedRestTimes.get(level) && !isCorrect) {
        return { user: updatedUser, addedReward: 0, error: 'OUT_OF_CHANCES' };
      }
    }

    return updatedUser ? { user: updatedUser, addedReward } : null;
  }

  async getQuizStatus(userId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) return null;
    return {
      quizStartTimes: user.quizStartTimes,
      restEndTimes: user.restEndTimes,
      levelProgress: user.levelProgress,
      levelSessionWrongAnswers: user.levelSessionWrongAnswers,
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
