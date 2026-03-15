import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Rank } from './schemas/rank.schema';

@Injectable()
export class RanksService {
  constructor(@InjectModel(Rank.name) private rankModel: Model<Rank>) {}

  async findAll(): Promise<Rank[]> {
    return this.rankModel.find().sort({ order: 1 }).exec();
  }

  async create(data: Partial<Rank>): Promise<Rank> {
    const created = new this.rankModel(data);
    return created.save();
  }

  async update(id: string, data: Partial<Rank>): Promise<Rank> {
    const updated = await this.rankModel.findByIdAndUpdate(id, data, { new: true }).exec();
    if (!updated) throw new NotFoundException('Rank not found');
    return updated;
  }

  async delete(id: string): Promise<any> {
    const deleted = await this.rankModel.findByIdAndDelete(id).exec();
    if (!deleted) throw new NotFoundException('Rank not found');
    return deleted;
  }

  async getRankByQuestions(questionsCount: number): Promise<Rank | null> {
    return this.rankModel
      .findOne({ minQuestions: { $lte: questionsCount } })
      .sort({ minQuestions: -1 })
      .exec();
  }

  async getNextRank(questionsCount: number): Promise<Rank | null> {
    return this.rankModel
      .findOne({ minQuestions: { $gt: questionsCount } })
      .sort({ minQuestions: 1 })
      .exec();
  }
}
