import { Controller, Get, Post, Body, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { StreaksService } from './streaks.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserRole } from '../users/schemas/user.schema';

@Controller('streaks')
@UseGuards(JwtAuthGuard)
export class StreaksController {
  constructor(private readonly streaksService: StreaksService) {}

  // --- User Endpoints ---
  @Get('my-streaks')
  async getMyStreaks(@Request() req: any) {
    return this.streaksService.getMyStreaks(req.user.userId);
  }

  // --- Admin Endpoints ---
  @Get('admin/rewards')
  async getAdminRewards(@Request() req: any) {
    if (req.user.role !== UserRole.ADMIN) {
      throw new Error('Unauthorized');
    }
    return this.streaksService.getAdminRewards();
  }

  @Post('admin/rewards')
  async createReward(@Request() req: any, @Body() body: any) {
    if (req.user.role !== UserRole.ADMIN) {
      throw new Error('Unauthorized');
    }
    return this.streaksService.createReward(body);
  }

  @Delete('admin/rewards/:id')
  async deleteReward(@Request() req: any, @Param('id') id: string) {
    if (req.user.role !== UserRole.ADMIN) {
      throw new Error('Unauthorized');
    }
    return this.streaksService.deleteReward(id);
  }

  @Post('admin/rewards/:id')
  async updateReward(@Request() req: any, @Param('id') id: string, @Body() body: any) {
    if (req.user.role !== UserRole.ADMIN) {
      throw new Error('Unauthorized');
    }
    return this.streaksService.updateReward(id, body);
  }
}
