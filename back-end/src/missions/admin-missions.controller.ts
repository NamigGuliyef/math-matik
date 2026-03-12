import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { MissionsService } from './missions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Mission } from './schemas/mission.schema';
import { Achievement } from './schemas/achievement.schema';
import { ChestReward } from './schemas/chest-reward.schema';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin/missions')
export class AdminMissionsController {
  constructor(
    @InjectModel(Mission.name) private missionModel: Model<Mission>,
    @InjectModel(Achievement.name) private achievementModel: Model<Achievement>,
    @InjectModel(ChestReward.name) private chestRewardModel: Model<ChestReward>,
  ) {}

  // Missions
  @Get('daily')
  async getDaily() {
    return this.missionModel.find().exec();
  }

  @Post('daily')
  async createDaily(@Body() data: any) {
    return new this.missionModel(data).save();
  }

  @Put('daily/:id')
  async updateDaily(@Param('id') id: string, @Body() data: any) {
    return this.missionModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  @Delete('daily/:id')
  async deleteDaily(@Param('id') id: string) {
    return this.missionModel.findByIdAndDelete(id).exec();
  }

  // Achievements
  @Get('achievements')
  async getAchievements() {
    return this.achievementModel.find().exec();
  }

  @Post('achievements')
  async createAchievement(@Body() data: any) {
    return new this.achievementModel(data).save();
  }

  @Put('achievements/:id')
  async updateAchievement(@Param('id') id: string, @Body() data: any) {
    return this.achievementModel
      .findByIdAndUpdate(id, data, { new: true })
      .exec();
  }

  @Delete('achievements/:id')
  async deleteAchievement(@Param('id') id: string) {
    return this.achievementModel.findByIdAndDelete(id).exec();
  }

  // Chest Rewards
  @Get('chest-rewards')
  async getChestRewards() {
    return this.chestRewardModel.find().exec();
  }

  @Post('chest-rewards')
  async createChestReward(@Body() data: any) {
    return new this.chestRewardModel(data).save();
  }

  @Put('chest-rewards/:id')
  async updateChestReward(@Param('id') id: string, @Body() data: any) {
    return this.chestRewardModel
      .findByIdAndUpdate(id, data, { new: true })
      .exec();
  }

  @Delete('chest-rewards/:id')
  async deleteChestReward(@Param('id') id: string) {
    return this.chestRewardModel.findByIdAndDelete(id).exec();
  }
}
