import { Controller, Get, Post, UseGuards, Request } from '@nestjs/common';
import { BattleService } from './battle.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('fighter/battle')
export class BattleController {
    constructor(private readonly battleService: BattleService) { }

    @Post('start')
    @UseGuards(JwtAuthGuard)
    async startBattle(@Request() req: any) {
        return this.battleService.startBattle(req.user.userId);
    }

    @Get('recent')
    @UseGuards(JwtAuthGuard)
    async getRecent(@Request() req: any) {
        return this.battleService.getRecentBattle(req.user.userId);
    }

    @Get('leaderboard')
    async getLeaderboard() {
        return this.battleService.getBattleLeaderboard();
    }
}
