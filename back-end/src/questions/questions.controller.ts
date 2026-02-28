import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UsersService } from '../users/users.service';

import { ActivityService } from '../activity/activity.service';
import { ActivityType } from '../activity/schemas/activity.schema';

@Controller('questions')
export class QuestionsController {
  constructor(
    private questionsService: QuestionsService,
    private usersService: UsersService,
    private activityService: ActivityService,
  ) { }

  @Get()
  async getAll() {
    return this.questionsService.findAll();
  }

  @Get('by-level')
  async getByLevel(@Query('level') level: string) {
    return this.questionsService.findByLevel(level);
  }

  @Get('available-levels')
  async getAvailableLevels() {
    return this.questionsService.getAvailableLevels();
  }

  @Get('level-counts')
  async getLevelQuestionCounts() {
    return this.questionsService.getLevelQuestionCounts();
  }

  @UseGuards(JwtAuthGuard)
  @Post('start')
  async startQuiz(@Request() req: any, @Body('level') level: string) {
    return this.usersService.startQuiz(req.user.userId, level);
  }

  @UseGuards(JwtAuthGuard)
  @Post('answer/:id')
  async answerQuestion(
    @Param('id') id: string,
    @Body() body: any,
    @Request() req: any,
  ) {
    const { answer, level, index } = body;
    const question = await this.questionsService.findOne(id);
    const isCorrect = question.correctAnswer === answer;
    const result = await this.usersService.addAnsweredQuestion(
      req.user.userId,
      id,
      isCorrect,
      question.rewardAmount,
      level,
      index,
    );

    // Log activity
    await this.activityService.log(
      req.user.userId,
      `${req.user.name} ${req.user.surname}`,
      isCorrect ? ActivityType.ANSWER_CORRECT : ActivityType.ANSWER_WRONG,
      `${question.level.toUpperCase()} sualına ${isCorrect ? 'düzgün' : 'səhv'} cavab verdi: "${question.text.substring(0, 30)}..."`,
    );

    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Get('status')
  async getStatus(@Request() req: any) {
    return this.usersService.findById(req.user.userId);
  }

  @Get('landing-stats')
  async getLandingStats() {
    return this.questionsService.getLandingStats();
  }
}
