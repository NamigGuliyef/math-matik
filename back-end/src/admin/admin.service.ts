import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Question } from '../questions/schemas/question.schema';
import { User, UserRole } from '../users/schemas/user.schema';
import { ActivityService } from '../activity/activity.service';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(Question.name) private questionModel: Model<Question>,
    @InjectModel(User.name) private userModel: Model<User>,
    private activityService: ActivityService,
  ) {}

  async getActivities(page: number = 1, limit: number = 20, search?: string) {
    return this.activityService.getFilteredActivities(page, limit, search);
  }

  async getStats() {
    const totalUsers = await this.userModel.countDocuments({
      role: UserRole.STUDENT,
    });
    const totalQuestions = await this.questionModel.countDocuments();
    const totalAnswers = await this.userModel.aggregate([
      { $group: { _id: null, count: { $sum: '$totalAnswered' } } },
    ]);

    return {
      totalUsers,
      totalQuestions,
      totalAnswers: totalAnswers[0]?.count || 0,
    };
  }

  async getAllUsers() {
    return this.userModel.find({ role: UserRole.STUDENT }).exec();
  }

  async getAllQuestions() {
    return this.questionModel.find().exec();
  }
}
