import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('leaderboard')
export class LeaderboardController {
  constructor(private usersService: UsersService) {}

  @Get()
  getLeaderboard() {
    return this.usersService.getLeaderboard();
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req: any) {
    return this.usersService.findById(req.user.userId);
  }
}
