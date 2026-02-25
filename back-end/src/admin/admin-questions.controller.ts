import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';
import { QuestionsService } from '../questions/questions.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('admin/questions')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminQuestionsController {
  constructor(private questionsService: QuestionsService) {}

  @Get()
  async findAll(
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('search') search: string,
  ) {
    return this.questionsService.findAll(
      Number(page) || 1,
      Number(limit) || 20,
      search || '',
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.questionsService.findOne(id);
  }

  @Post()
  async create(@Body() body: any) {
    return this.questionsService.create(body);
  }

  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  async importExcel(@UploadedFile() file: any) {
    return this.questionsService.importFromExcel(file.buffer);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    return this.questionsService.update(id, body);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.questionsService.delete(id);
  }
}
