import {
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Post('upload-avatar')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(@Request() req: any, @UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Fayl seçilməyib');
    }

    try {
      const result = await this.cloudinaryService.uploadFile(file);
      const updatedUser = await this.usersService.updateProfilePicture(
        req.user.userId,
        result.secure_url,
      );
      return updatedUser;
    } catch (error) {
      throw new BadRequestException('Şəkil yüklənərkən xəta baş verdi: ' + error.message);
    }
  }
}
