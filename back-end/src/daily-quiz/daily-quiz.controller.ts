import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { DailyQuizService } from './daily-quiz.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserRole } from '../users/schemas/user.schema';

@Controller('daily-quiz')
export class DailyQuizController {
  constructor(private readonly dailyQuizService: DailyQuizService) {}

  // --- Admin Endpoints ---

  @UseGuards(JwtAuthGuard)
  @Post('admin')
  async createDailyQuiz(@Request() req: any, @Body() body: any) {
    if (req.user.role !== UserRole.ADMIN) {
      throw new Error('Unauthorized');
    }
    return this.dailyQuizService.createDailyQuiz(body);
  }

  @UseGuards(JwtAuthGuard)
  @Get('admin')
  async getAdminQuizzes(@Request() req: any) {
    if (req.user.role !== UserRole.ADMIN) {
      throw new Error('Unauthorized');
    }
    return this.dailyQuizService.getAdminQuizzes();
  }

  @UseGuards(JwtAuthGuard)
  @Delete('admin/:id')
  async deleteDailyQuiz(@Request() req: any, @Param('id') id: string) {
    if (req.user.role !== UserRole.ADMIN) {
      throw new Error('Unauthorized');
    }
    return this.dailyQuizService.deleteDailyQuiz(id);
  }

  // --- User Endpoints ---

  @UseGuards(JwtAuthGuard)
  @Get('today')
  async getTodayQuiz(@Request() req: any, @Query('date') date: string) {
    return this.dailyQuizService.getTodayQuizForUser(req.user.userId, date);
  }

  @UseGuards(JwtAuthGuard)
  @Post('submit')
  async submitQuiz(
    @Request() req: any,
    @Body() body: { quizId: string; answers: Record<string, string>; date: string },
  ) {
    return this.dailyQuizService.submitQuiz(req.user.userId, body.quizId, body.answers, body.date);
  }
}
