import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';

@Controller('chat')
export class ChatController {
    constructor(private readonly chatService: ChatService) { }

    @Get()
    @UseGuards(OptionalJwtAuthGuard)
    async getMessages(@Request() req: any) {
        // We can try to get user from token if it exists
        const userId = req.user?.userId;
        return this.chatService.getMessages(userId);
    }

    @Get('online')
    async getOnlineUsers() {
        return this.chatService.getOnlineUsers();
    }

    @Post()
    @UseGuards(JwtAuthGuard)
    async postMessage(@Request() req: any, @Body('message') message: string) {
        return this.chatService.postMessage(req.user.userId, message);
    }
}
