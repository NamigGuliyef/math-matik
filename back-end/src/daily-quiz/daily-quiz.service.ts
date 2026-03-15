import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DailyQuiz, DailyQuizDocument } from './schemas/daily-quiz.schema';
import { Question } from '../questions/schemas/question.schema';
import { UsersService } from '../users/users.service';

import { StreaksService } from '../streaks/streaks.service';

@Injectable()
export class DailyQuizService {
  constructor(
    @InjectModel(DailyQuiz.name) private dailyQuizModel: Model<DailyQuizDocument>,
    @InjectModel(Question.name) private questionModel: Model<Question>,
    private usersService: UsersService,
    private streaksService: StreaksService,
  ) {}

  // --- Admin Methods ---

  async createDailyQuiz(data: Partial<DailyQuiz>) {
    const existing = await this.dailyQuizModel.findOne({
      date: data.date,
      grade: data.grade,
    });
    
    if (existing) {
      throw new BadRequestException('A Daily Quiz already exists for this date and class.');
    }

    if (data.selectionMethod === 'random') {
      const gradeNum = (data.grade || '').toString().replace(/[^0-9]/g, '');
      const gradeStr = gradeNum ? `Sinif ${gradeNum}` : data.grade;

      const randomQuestions = await this.questionModel.aggregate([
        { 
          $match: { 
            $or: [
              { grade: data.grade },
              { grade: gradeNum },
              { grade: gradeStr },
            ] 
          } 
        },
        { $sample: { size: 10 } },
      ]);
      if (randomQuestions.length < 10) {
        throw new BadRequestException('Not enough questions available for this class.');
      }
      data.questions = randomQuestions.map((q) => q._id);
    } else {
      if (!data.questions || data.questions.length !== 10) {
        throw new BadRequestException('Manual selection requires exactly 10 questions.');
      }
    }

    const created = new this.dailyQuizModel(data);
    return created.save();
  }

  async getAdminQuizzes() {
    return this.dailyQuizModel.find().populate('questions').sort({ date: -1 });
  }

  async deleteDailyQuiz(id: string) {
    return this.dailyQuizModel.findByIdAndDelete(id);
  }

  // --- User Methods ---

  async getTodayQuizForUser(userId: string, date: string) {
    const user = await this.usersService.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    if (user.lastDailyQuizDate === date) {
      return { alreadyPlayed: true, message: 'Bugünkü Daily Quiz artıq tamamlanıb.' };
    }

    const numericalGrade = (user.grade || '').toString().replace(/[^0-9]/g, '');

    const quizzes = await this.dailyQuizModel.find({ date }).populate('questions');
    const quiz = quizzes.find(q => {
      const qGradeNum = (q.grade || '').toString().replace(/[^0-9]/g, '');
      return qGradeNum === numericalGrade || q.grade === user.grade;
    });

    if (!quiz) {
      return { notFound: true, message: 'Bugün üçün Daily Quiz təyin edilməyib.' };
    }

    return { quiz, alreadyPlayed: false };
  }

  async submitQuiz(userId: string, quizId: string, answers: Record<string, string>, date: string) {
    const user = await this.usersService.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    
    if (user.lastDailyQuizDate === date) {
      throw new BadRequestException('Bugünkü Daily Quiz artıq tamamlanıb.');
    }

    const quiz = await this.dailyQuizModel.findById(quizId).populate('questions');
    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }

    let correctCount = 0;
    for (const q of quiz.questions as any[]) {
      if (answers[q._id.toString()] === q.correctAnswer) {
        correctCount++;
      }
    }

    const updateData: any = { lastDailyQuizDate: date };
    let rewardGiven = false;

    if (correctCount >= 8) {
      rewardGiven = true;
      if (quiz.rewardAzn > 0) {
        updateData.balance = (user.balance || 0) + quiz.rewardAzn;
      }
      if (quiz.rewardChest > 0) {
        updateData.chests = (user.chests || 0) + quiz.rewardChest;
      }
    }

    await this.usersService.updateStats(userId, updateData);

    // --- Streak Tracking ---
    const streakRewards: any[] = [];
    try {
      const dailyLog = await this.streaksService.logActivity(userId, 'daily', true);
      if (dailyLog?.rewardedMilestones) streakRewards.push(...dailyLog.rewardedMilestones);
    } catch (e) {
      console.error('Error logging daily streak in daily-quiz:', e);
    }
    // -----------------------

    return {
      correctCount,
      totalCount: quiz.questions.length,
      rewardGiven,
      rewardAzn: rewardGiven ? quiz.rewardAzn : 0,
      rewardChest: rewardGiven ? quiz.rewardChest : 0,
      streakRewards,
    };
  }
}
