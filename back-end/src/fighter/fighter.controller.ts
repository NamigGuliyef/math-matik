import { Controller, Get, Post, Param, UseGuards, Request } from '@nestjs/common';
import { FighterService } from './fighter.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('fighter')
@UseGuards(JwtAuthGuard)
export class FighterController {
    constructor(private readonly fighterService: FighterService) { }

    @Get()
    async getFighter(@Request() req: any) {
        return this.fighterService.getUserFighter(req.user.userId);
    }

    @Get('shop')
    async getShop() {
        return this.fighterService.getShopItems();
    }

    @Post('purchase/:itemId')
    async purchase(@Request() req: any, @Param('itemId') itemId: string) {
        return this.fighterService.purchaseItem(req.user.userId, itemId);
    }

    @Post('equip/:inventoryId')
    async equip(@Request() req: any, @Param('inventoryId') inventoryId: string) {
        return this.fighterService.equipItem(req.user.userId, inventoryId);
    }

    @Post('unequip/:inventoryId')
    async unequip(@Request() req: any, @Param('inventoryId') inventoryId: string) {
        return this.fighterService.unequipItem(req.user.userId, inventoryId);
    }
}
