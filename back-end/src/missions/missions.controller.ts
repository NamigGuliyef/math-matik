import { Controller, Get, Post, Param, UseGuards, Request } from '@nestjs/common';
import { MissionsService } from './missions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('missions')
export class MissionsController {
    constructor(private readonly missionsService: MissionsService) { }

    @UseGuards(JwtAuthGuard)
    @Get()
    async getMissions(@Request() req: any) {
        return this.missionsService.getPlayerMissions(req.user.userId);
    }

    @UseGuards(JwtAuthGuard)
    @Post('claim/:id')
    async claim(@Request() req: any, @Param('id') id: string) {
        return this.missionsService.claimReward(req.user.userId, id);
    }

    @UseGuards(JwtAuthGuard)
    @Post('open-chest')
    async openChest(@Request() req: any) {
        return this.missionsService.openChest(req.user.userId);
    }
}
