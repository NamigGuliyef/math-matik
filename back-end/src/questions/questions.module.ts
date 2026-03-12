import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Question, QuestionSchema } from './schemas/question.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { QuestionsService } from './questions.service';
import { QuestionsController } from './questions.controller';
import { ChatModule } from '../chat/chat.module';
import { FighterModule } from '../fighter/fighter.module';
import { QuizService } from './quiz.service';
import {
  FighterItem,
  FighterItemSchema,
} from '../fighter/schemas/fighter-item.schema';
import {
  UserInventory,
  UserInventorySchema,
} from '../fighter/schemas/user-inventory.schema';
import { MissionsModule } from '../missions/missions.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Question.name, schema: QuestionSchema },
      { name: User.name, schema: UserSchema },
    ]),
    MongooseModule.forFeature([
      { name: FighterItem.name, schema: FighterItemSchema },
      { name: UserInventory.name, schema: UserInventorySchema },
    ]),
    ChatModule,
    FighterModule,
    MissionsModule,
  ],
  providers: [QuestionsService, QuizService],
  controllers: [QuestionsController],
  exports: [QuestionsService, QuizService],
})
export class QuestionsModule {}
