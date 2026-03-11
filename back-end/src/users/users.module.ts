import { Module, Global } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { MissionsModule } from '../missions/missions.module';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { Battle, BattleSchema } from '../fighter/schemas/battle.schema';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Battle.name, schema: BattleSchema }
    ]),
    MissionsModule,
    CloudinaryModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService, MongooseModule],
})
export class UsersModule { }
