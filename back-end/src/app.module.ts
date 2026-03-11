import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { QuestionsModule } from './questions/questions.module';
import { AdminModule } from './admin/admin.module';
import { LeaderboardController } from './leaderboard/leaderboard.controller';
import { ActivityModule } from './activity/activity.module';
import { FighterModule } from './fighter/fighter.module';
import { ConfigModule } from '@nestjs/config';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { ChatModule } from './chat/chat.module';
import { MissionsModule } from './missions/missions.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(
      'mongodb://football:football1@ac-qpwsq2x-shard-00-00.kk1kc8e.mongodb.net:27017,ac-qpwsq2x-shard-00-01.kk1kc8e.mongodb.net:27017,ac-qpwsq2x-shard-00-02.kk1kc8e.mongodb.net:27017/math?replicaSet=atlas-4hkr4k-shard-0&ssl=true&authSource=admin',
    ),
    AuthModule,
    UsersModule,
    QuestionsModule,
    AdminModule,
    ActivityModule,
    FighterModule,
    CloudinaryModule,
    ChatModule,
    MissionsModule,
  ],
  controllers: [LeaderboardController],
  providers: [],
})
export class AppModule { }
