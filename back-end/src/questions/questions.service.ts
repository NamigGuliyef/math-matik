import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Question } from './schemas/question.schema';
import { User, UserRole } from '../users/schemas/user.schema';
import * as XLSX from 'xlsx';

@Injectable()
export class QuestionsService {
  constructor(
    @InjectModel(Question.name) private questionModel: Model<Question>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async create(data: any): Promise<Question> {
    const newQuestion = new this.questionModel(data);
    return newQuestion.save();
  }

  async findAll(
    page: number = 1,
    limit: number = 20,
    search: string = '',
  ): Promise<{ questions: Question[]; total: number }> {
    const skip = (page - 1) * limit;
    const query = search
      ? {
          $or: [
            { text: { $regex: search, $options: 'i' } },
            { level: { $regex: search, $options: 'i' } },
            { grade: { $regex: search, $options: 'i' } },
          ],
        }
      : {};

    const [questions, total] = await Promise.all([
      this.questionModel.find(query).skip(skip).limit(limit).exec(),
      this.questionModel.countDocuments(query).exec(),
    ]);
    return { questions, total };
  }

  async findByLevel(grade: string, level: string): Promise<Question[]> {
    return this.questionModel.find({ grade, level }).exec();
  }

  async findByLevelAndStage(
    grade: string,
    level: string,
    stage: number,
  ): Promise<Question[]> {
    return this.questionModel.find({ grade, level, stage }).exec();
  }

  async findOne(id: string): Promise<Question> {
    const question = await this.questionModel.findById(id).exec();
    if (!question) {
      throw new NotFoundException(`Question with ID "${id}" not found`);
    }
    return question;
  }

  async update(id: string, data: any): Promise<Question> {
    const question = await this.questionModel
      .findByIdAndUpdate(id, data, { new: true })
      .exec();
    if (!question) {
      throw new NotFoundException(`Question with ID "${id}" not found`);
    }
    return question;
  }

  async delete(id: string): Promise<Question> {
    const question = await this.questionModel.findByIdAndDelete(id).exec();
    if (!question) {
      throw new NotFoundException(`Question with ID "${id}" not found`);
    }
    return question;
  }

  async importFromExcel(
    buffer: Buffer,
  ): Promise<{ success: number; failed: number }> {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    let successCount = 0;
    let failedCount = 0;

    for (const row of data as any[]) {
      try {
        const questionData = {
          grade: String(row.grade || row.class || '5A'),
          level: String(row.level || 'level1'),
          text: String(row.text),
          options: [row.option1, row.option2, row.option3, row.option4]
            .filter(
              (opt) =>
                opt !== undefined && opt !== null && String(opt).trim() !== '',
            )
            .map((opt) => String(opt)),
          correctAnswer: String(row.correctAnswer),
          rewardAmount: Number(row.rewardAmount) || 0.001,
          stage:
            (typeof row.stage === 'string'
              ? parseInt(row.stage.replace(/\D/g, ''))
              : Number(row.stage)) || 1,
        };

        const newQuestion = new this.questionModel(questionData);
        await newQuestion.save();
        successCount++;
      } catch (error) {
        console.error('Error importing question row:', row, error);
        failedCount++;
      }
    }

    return { success: successCount, failed: failedCount };
  }

  async exportToExcel(): Promise<Buffer> {
    const questions = await this.questionModel.find().lean().exec();

    const rows = questions.map((q: any) => ({
      grade: q.grade,
      level: q.level,
      text: q.text,
      option1: q.options?.[0] ?? '',
      option2: q.options?.[1] ?? '',
      option3: q.options?.[2] ?? '',
      option4: q.options?.[3] ?? '',
      correctAnswer: q.correctAnswer,
      rewardAmount: q.rewardAmount,
      stage: q.stage || 1,
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Suallar');

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    return buffer;
  }

  async getAvailableClasses(): Promise<string[]> {
    return this.questionModel.distinct('grade').exec();
  }

  async getAvailableLevels(grade?: string): Promise<string[]> {
    const query = grade ? { grade } : {};
    return this.questionModel.distinct('level', query).exec();
  }

  async getLevelQuestionCounts(): Promise<
    Record<string, { totalQuestions: number; totalStages: number }>
  > {
    const stats = await this.questionModel.aggregate([
      {
        $group: {
          _id: { grade: '$grade', level: '$level' },
          totalQuestions: { $sum: 1 },
          stages: { $addToSet: '$stage' },
        },
      },
      {
        $project: {
          _id: 1,
          totalQuestions: 1,
          totalStages: { $size: '$stages' },
        },
      },
    ]);

    const result: Record<
      string,
      { totalQuestions: number; totalStages: number }
    > = {};
    for (const item of stats) {
      const key = `${item._id.grade}:${item._id.level}`;
      result[key] = {
        totalQuestions: item.totalQuestions,
        totalStages: item.totalStages,
      };
      // Fallback for UI if it only sends level
      if (!result[item._id.level]) {
        result[item._id.level] = result[key];
      }
    }
    return result;
  }

  async getStagesByLevel(grade: string, level: string): Promise<any[]> {
    const stages = await this.questionModel.aggregate([
      { $match: { grade, level } },
      {
        $group: {
          _id: '$stage',
          totalQuestions: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return stages.map((s) => ({
      stage: s._id,
      totalQuestions: s.totalQuestions,
    }));
  }

  async getLandingStats() {
    const totalQuestions = await this.questionModel.countDocuments().exec();
    const levels = await this.questionModel.distinct('level').exec();
    const totalStudents = await this.userModel
      .countDocuments({ role: UserRole.STUDENT })
      .exec();

    const totalCorrectAnswers = await this.userModel.aggregate([
      { $group: { _id: null, count: { $sum: '$correctAnswers' } } },
    ]);

    const distinctStages = await this.questionModel.aggregate([
      {
        $group: { _id: { grade: '$grade', level: '$level', stage: '$stage' } },
      },
      { $count: 'total' },
    ]);

    return {
      totalQuestions: totalQuestions as number,
      totalLevels: levels.length,
      totalStages: (distinctStages[0] as any)?.total || 0,
      totalStudents: totalStudents as number,
      totalCorrectAnswers: (totalCorrectAnswers[0] as any)?.count || 0,
    };
  }
}
