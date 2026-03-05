import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { FighterService } from './fighter.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';

@Controller('admin/fighter')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminFighterController {
    constructor(private readonly fighterService: FighterService) { }

    @Get('items')
    async getItems() {
        return this.fighterService.getAllItems();
    }

    @Post('items')
    async createItem(@Body() itemData: any) {
        return this.fighterService.createItem(itemData);
    }

    @Delete('items/clear-all')
    async clearAllItems() {
        return this.fighterService.clearAllItems();
    }

    @Delete('items/:id')
    async deleteItem(@Param('id') id: string) {
        return this.fighterService.deleteItem(id);
    }

    @Post('upload')
    @UseInterceptors(
        FileInterceptor('file', {
            storage: diskStorage({
                destination: process.env.VERCEL ? '/tmp/uploads' : './uploads',
                filename: (req, file, cb) => {
                    const randomName = Array(32)
                        .fill(null)
                        .map(() => Math.round(Math.random() * 16).toString(16))
                        .join('');
                    return cb(null, `${randomName}${extname(file.originalname)}`);
                },
            }),
            fileFilter: (req, file, cb) => {
                if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
                    return cb(new BadRequestException('Yalnız şəkil faylları qəbul edilir!'), false);
                }
                cb(null, true);
            },
            limits: {
                fileSize: 5 * 1024 * 1024, // 5MB
            },
        }),
    )
    uploadFile(@UploadedFile() file: any) {
        if (!file) {
            throw new BadRequestException('Fayl yüklənmədi!');
        }
        return {
            url: `/uploads/${file.filename}`,
        };
    }

    // Character Management Endpoints
    @Get('characters')
    async getCharacters() {
        return this.fighterService.getAllCharacters();
    }

    @Post('characters')
    async createCharacter(@Body() characterData: any) {
        return this.fighterService.createCharacter(characterData);
    }

    @Delete('characters/:id')
    async deleteCharacter(@Param('id') id: string) {
        return this.fighterService.deleteCharacter(id);
    }
}
