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
  ) { }

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
        ],
      }
      : {};

    const [questions, total] = await Promise.all([
      this.questionModel.find(query).skip(skip).limit(limit).exec(),
      this.questionModel.countDocuments(query).exec(),
    ]);
    return { questions, total };
  }

  async findByLevel(level: string): Promise<Question[]> {
    return this.questionModel.find({ level }).exec();
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
          level: String(row.level || 'level1'),
          text: String(row.text),
          options: [
            String(row.option1),
            String(row.option2),
            String(row.option3),
            String(row.option4),
          ],
          correctAnswer: String(row.correctAnswer),
          rewardAmount: Number(row.rewardAmount) || 0.001,
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

  async getAvailableLevels(): Promise<string[]> {
    return this.questionModel.distinct('level').exec();
  }

  async getLevelQuestionCounts(): Promise<Record<string, number>> {
    const counts = await this.questionModel.aggregate([
      { $group: { _id: '$level', count: { $sum: 1 } } },
    ]);
    const result: Record<string, number> = {};
    for (const item of counts) {
      result[item._id] = item.count;
    }
    return result;
  }

  async getLandingStats() {
    const totalQuestions = await this.questionModel.countDocuments().exec();
    const levels = await this.questionModel.distinct('level').exec();
    const totalStudents = await this.userModel.countDocuments({ role: UserRole.STUDENT }).exec();

    const totalCorrectAnswers = await this.userModel.aggregate([
      { $group: { _id: null, count: { $sum: '$correctAnswers' } } },
    ]);

    return {
      totalQuestions,
      totalLevels: levels.length,
      totalStudents,
      totalCorrectAnswers: totalCorrectAnswers[0]?.count || 0,
    };
  }
}
