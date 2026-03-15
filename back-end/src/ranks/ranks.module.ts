import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Rank, RankSchema } from './schemas/rank.schema';
import { RanksService } from './ranks.service';
import { RanksController } from './ranks.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Rank.name, schema: RankSchema }]),
  ],
  providers: [RanksService],
  controllers: [RanksController],
  exports: [RanksService],
})
export class RanksModule {}
