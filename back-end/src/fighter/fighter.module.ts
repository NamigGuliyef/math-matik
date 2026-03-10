import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FighterService } from './fighter.service';
import { BattleService } from './battle.service';
import { FighterController } from './fighter.controller';
import { BattleController } from './battle.controller';
import { AdminFighterController } from './admin-fighter.controller';
import { FighterItem, FighterItemSchema } from './schemas/fighter-item.schema';
import { UserInventory, UserInventorySchema } from './schemas/user-inventory.schema';
import { Character, CharacterSchema } from './schemas/character.schema';
import { Battle, BattleSchema } from './schemas/battle.schema';
import { User, UserSchema } from '../users/schemas/user.schema';

import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: FighterItem.name, schema: FighterItemSchema },
            { name: UserInventory.name, schema: UserInventorySchema },
            { name: Character.name, schema: CharacterSchema },
            { name: User.name, schema: UserSchema },
            { name: Battle.name, schema: BattleSchema },
        ]),
        CloudinaryModule,
        MissionsModule,
    ],
    controllers: [FighterController, AdminFighterController, BattleController],
    providers: [FighterService, BattleService],
    exports: [FighterService, BattleService],
})
export class FighterModule { }
