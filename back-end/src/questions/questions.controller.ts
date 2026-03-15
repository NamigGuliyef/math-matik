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
import { QuizService } from './quiz.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UsersService } from '../users/users.service';
import { ChatService } from '../chat/chat.service';

import { ActivityService } from '../activity/activity.service';
import { ActivityType } from '../activity/schemas/activity.schema';

@Controller('questions')
export class QuestionsController {
  constructor(
    private questionsService: QuestionsService,
    private quizService: QuizService,
    private usersService: UsersService,
    private activityService: ActivityService,
    private chatService: ChatService,
  ) {}

  @Get()
  async getAll() {
    return this.questionsService.findAll();
  }

  @Get('by-level')
  async getByLevel(
    @Query('grade') grade: string,
    @Query('level') level: string,
  ) {
    return this.questionsService.findByLevel(grade, level);
  }

  @Get('available-classes')
  async getAvailableClasses() {
    return this.questionsService.getAvailableClasses();
  }

  @Get('available-levels')
  async getAvailableLevels(@Query('grade') grade?: string) {
    return this.questionsService.getAvailableLevels(grade);
  }

  @Get('level-counts')
  async getLevelQuestionCounts() {
    return this.questionsService.getLevelQuestionCounts();
  }

  @Get('stages')
  async getStages(
    @Query('grade') grade: string,
    @Query('level') level: string,
  ) {
    return this.questionsService.getStagesByLevel(grade, level);
  }

  @Get('by-stage')
  async getByStage(
    @Query('grade') grade: string,
    @Query('level') level: string,
    @Query('stage') stage: string,
  ) {
    return this.questionsService.findByLevelAndStage(
      grade,
      level,
      Number(stage) || 1,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('start')
  async startQuiz(
    @Request() req: any,
    @Body() body: { grade: string; level: string },
  ) {
    return this.usersService.startQuiz(req.user.userId, body.grade, body.level);
  }

  @UseGuards(JwtAuthGuard)
  @Post('answer/:id')
  async answerQuestion(
    @Param('id') id: string,
    @Body() body: any,
    @Request() req: any,
  ) {
    const { answer, grade, level, index } = body;
    const question = await this.questionsService.findOne(id);
    const isCorrect = question.correctAnswer === answer;
    const result = await this.usersService.addAnsweredQuestion(
      req.user.userId,
      id,
      isCorrect,
      question.rewardAmount,
      grade,
      level,
      index,
      body,
    );

    // Log activity
    await this.activityService.log(
      req.user.userId,
      `${req.user.name} ${req.user.surname}`,
      isCorrect ? ActivityType.ANSWER_CORRECT : ActivityType.ANSWER_WRONG,
      `${question.level.toUpperCase()} sualına ${isCorrect ? 'düzgün' : 'səhv'} cavab verdi: "${question.text.substring(0, 30)}..."`,
    );

    // If quiz is finished or chances are out, and it's a finish scenario
    if (result && isCorrect) {
      // We can check if the index matches the total question count for that level
      const counts = await this.questionsService.getLevelQuestionCounts();
      const levelKey = `${grade}:${level}`;
      const levelStats = counts[levelKey] || counts[level];
      const totalInLevel = levelStats?.totalQuestions || 0;

      if (index === totalInLevel) {
        // Quiz finished successfully
        const name = req.user.name;
        await this.chatService.createSystemMessage(
          `🔥 ${name} quiz-i ${totalInLevel}/${totalInLevel} nəticə ilə tamamladı!`,
        );
      }
    }

    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Get('status')
  async getStatus(@Request() req: any) {
    await this.usersService.syncBattleWins(req.user.userId);
    return this.usersService.findById(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('complete-stage')
  async completeStage(
    @Request() req: any,
    @Body() body: { grade: string; level: string; stage: number },
  ) {
    const userId = req.user.userId;
    return this.quizService.completeStage(
      userId,
      body.grade,
      body.level,
      body.stage,
    );
  }

  @Get('landing-stats')
  async getLandingStats() {
    return this.questionsService.getLandingStats();
  }
}
