import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { DailyQuiz, DailyQuizSchema } from './schemas/daily-quiz.schema';
import { Question, QuestionSchema } from '../questions/schemas/question.schema';
import { UsersModule } from '../users/users.module';
import { DailyQuizController } from './daily-quiz.controller';
import { DailyQuizService } from './daily-quiz.service';
import { StreaksModule } from '../streaks/streaks.module';

@Module({
  imports: [
    StreaksModule,
    MongooseModule.forFeature([
      { name: DailyQuiz.name, schema: DailyQuizSchema },
      { name: Question.name, schema: QuestionSchema },
    ]),
    UsersModule,
  ],
  controllers: [DailyQuizController ],
  providers: [DailyQuizService],
  exports: [DailyQuizService],
})
export class DailyQuizModule { }
