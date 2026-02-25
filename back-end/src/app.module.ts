import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { QuestionsModule } from './questions/questions.module';
import { AdminModule } from './admin/admin.module';
import { LeaderboardController } from './leaderboard/leaderboard.controller';
import { ActivityModule } from './activity/activity.module';
@Module({
  imports: [
    MongooseModule.forRoot(
      'mongodb+srv://football:football1@cluster0.kk1kc8e.mongodb.net/math?retryWrites=true&w=majority&appName=Cluster0',
    ),
    AuthModule,
    UsersModule,
    QuestionsModule,
    AdminModule,
    ActivityModule,
  ],
  controllers: [LeaderboardController],
  providers: [],
})
export class AppModule {}
