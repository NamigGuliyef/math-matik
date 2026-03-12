import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FighterService } from './fighter.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';

import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Controller('admin/fighter')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminFighterController {
  constructor(
    private readonly fighterService: FighterService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

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
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: any) {
    console.log('Upload request received');
    if (!file) {
      console.error('No file in request');
      throw new BadRequestException('Fayl yüklənmədi!');
    }

    console.log('File details:', {
      originalname: file.originalname,
      bufferSize: file.buffer?.length,
      mimetype: file.mimetype,
    });

    try {
      const result = await this.cloudinaryService.uploadFile(file);
      console.log('Cloudinary upload success:', result.secure_url);
      return {
        url: result.secure_url,
      };
    } catch (error) {
      console.error('Upload Error in Controller:', error.message);
      console.error('Full Error:', error);
      throw new BadRequestException(`Yükləmə xətası: ${error.message}`);
    }
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
