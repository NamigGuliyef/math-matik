import { Module, Global } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { MissionsModule } from '../missions/missions.module';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MissionsModule,
  ],
  providers: [UsersService],
  exports: [UsersService, MongooseModule],
})
export class UsersModule { }
