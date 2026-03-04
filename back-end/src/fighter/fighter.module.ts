import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FighterService } from './fighter.service';
import { FighterController } from './fighter.controller';
import { AdminFighterController } from './admin-fighter.controller';
import { FighterItem, FighterItemSchema } from './schemas/fighter-item.schema';
import { UserInventory, UserInventorySchema } from './schemas/user-inventory.schema';
import { Character, CharacterSchema } from './schemas/character.schema';
import { User, UserSchema } from '../users/schemas/user.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: FighterItem.name, schema: FighterItemSchema },
            { name: UserInventory.name, schema: UserInventorySchema },
            { name: Character.name, schema: CharacterSchema },
            { name: User.name, schema: UserSchema },
        ]),
    ],
    controllers: [FighterController, AdminFighterController],
    providers: [FighterService],
    exports: [FighterService],
})
export class FighterModule { }
