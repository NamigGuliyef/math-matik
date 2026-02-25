import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Activity, ActivityType } from './schemas/activity.schema';

@Injectable()
export class ActivityService {
  constructor(
    @InjectModel(Activity.name) private activityModel: Model<Activity>,
  ) {}

  async log(
    userId: string,
    userName: string,
    type: ActivityType,
    description: string,
  ): Promise<Activity> {
    const activity = new this.activityModel({
      userId,
      userName,
      type,
      description,
    });
    return activity.save();
  }

  async getFilteredActivities(
    page: number = 1,
    limit: number = 20,
    searchTerm?: string,
  ): Promise<{ activities: Activity[]; total: number }> {
    const query: any = {};
    if (searchTerm) {
      query.userName = { $regex: searchTerm, $options: 'i' };
    }

    const skip = (page - 1) * limit;

    const [activities, total] = await Promise.all([
      this.activityModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.activityModel.countDocuments(query).exec(),
    ]);

    return { activities, total };
  }
}
