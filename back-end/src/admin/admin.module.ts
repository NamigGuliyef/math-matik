import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminService } from './admin.service';
import { AdminQuestionsController } from './admin-questions.controller';
import { AdminUsersController } from './admin-users.controller';
import { Question, QuestionSchema } from '../questions/schemas/question.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { QuestionsModule } from '../questions/questions.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Question.name, schema: QuestionSchema },
      { name: User.name, schema: UserSchema },
    ]),
    QuestionsModule,
    UsersModule,
  ],
  controllers: [AdminQuestionsController, AdminUsersController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
