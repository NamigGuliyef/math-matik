import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards, Request } from '@nestjs/common';
import { RanksService } from './ranks.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserRole } from '../users/schemas/user.schema';

@Controller('ranks')
export class RanksController {
  constructor(private readonly ranksService: RanksService) {}

  @Get()
  async findAll() {
    return this.ranksService.findAll();
  }

  @Get('my-rank')
  @UseGuards(JwtAuthGuard)
  async getMyRank(@Request() req: any) {
    const questionsCount = req.user.totalAnswered || 0;
    const currentRank = await this.ranksService.getRankByQuestions(questionsCount);
    const nextRank = await this.ranksService.getNextRank(questionsCount);
    return { currentRank, nextRank, totalAnswered: questionsCount };
  }

  // Admin Endpoints
  @Post('admin')
  @UseGuards(JwtAuthGuard)
  async create(@Request() req: any, @Body() body: any) {
    if (req.user.role !== UserRole.ADMIN) throw new Error('Unauthorized');
    return this.ranksService.create(body);
  }

  @Put('admin/:id')
  @UseGuards(JwtAuthGuard)
  async update(@Request() req: any, @Param('id') id: string, @Body() body: any) {
    if (req.user.role !== UserRole.ADMIN) throw new Error('Unauthorized');
    return this.ranksService.update(id, body);
  }

  @Delete('admin/:id')
  @UseGuards(JwtAuthGuard)
  async delete(@Request() req: any, @Param('id') id: string) {
    if (req.user.role !== UserRole.ADMIN) throw new Error('Unauthorized');
    return this.ranksService.delete(id);
  }
}
