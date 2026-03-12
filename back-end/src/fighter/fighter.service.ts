import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { FighterItem } from './schemas/fighter-item.schema';
import { UserInventory } from './schemas/user-inventory.schema';
import { Character } from './schemas/character.schema';
import { User } from '../users/schemas/user.schema';

@Injectable()
export class FighterService {
  constructor(
    @InjectModel(FighterItem.name) private itemModel: Model<FighterItem>,
    @InjectModel(UserInventory.name)
    private inventoryModel: Model<UserInventory>,
    @InjectModel(Character.name) private characterModel: Model<Character>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  // Admin methods
  async createItem(itemData: Partial<FighterItem>) {
    return new this.itemModel(itemData).save();
  }

  async getAllItems() {
    return this.itemModel.find().exec();
  }

  async deleteItem(id: string) {
    return this.itemModel.findByIdAndDelete(id).exec();
  }

  async clearAllItems() {
    await this.inventoryModel.deleteMany({}).exec();
    return this.itemModel.deleteMany({}).exec();
  }

  // Character Management
  async createCharacter(characterData: Partial<Character>) {
    return new this.characterModel(characterData).save();
  }

  async getAllCharacters() {
    return this.characterModel.find().exec();
  }

  async deleteCharacter(id: string) {
    return this.characterModel.findByIdAndDelete(id).exec();
  }

  async getFeaturedCharacter() {
    const characters = await this.characterModel.find().exec();
    if (characters.length === 0) return null;
    // Return a random character
    return characters[Math.floor(Math.random() * characters.length)];
  }

  // User methods
  async getShopItems() {
    const items = await this.itemModel.find().sort({ level: 1 }).exec();
    const characters = await this.characterModel
      .find()
      .sort({ level: 1 })
      .exec();
    return { items, characters };
  }

  async getUserFighter(userId: string) {
    const userIdObj = new Types.ObjectId(userId);
    const inventory = await this.inventoryModel
      .find({ userId: userIdObj })
      .populate('itemId')
      .populate('characterId')
      .exec();

    const equipped = inventory.filter((i) => i.isEquipped);
    const bag = inventory.filter((i) => !i.isEquipped);

    return { equipped, bag };
  }

  async purchaseItem(userId: string, itemId: string) {
    const userIdObj = new Types.ObjectId(userId);
    const itemIdObj = new Types.ObjectId(itemId);

    const item = await this.itemModel.findById(itemIdObj);
    if (!item) throw new NotFoundException('Item tapılmadı');

    const user = await this.userModel.findById(userIdObj);
    if (!user) throw new NotFoundException('İstifadəçi tapılmadı');

    const balanceRounded = Math.round(user.balance * 10000);
    const priceRounded = Math.round(item.price * 10000);

    if (balanceRounded < priceRounded) {
      throw new BadRequestException(
        `Balansınız kifayət deyil. Balans: ${user.balance} AZN, Qiymət: ${item.price} AZN`,
      );
    }

    const updatedUser = await this.userModel.findByIdAndUpdate(
      userIdObj,
      {
        $inc: { balance: -item.price },
      },
      { new: true },
    );

    const newItem = new this.inventoryModel({
      userId: userIdObj,
      itemId: itemIdObj,
      isEquipped: false,
    });
    const inventoryRecord = await newItem.save();

    return { inventoryRecord, balance: updatedUser?.balance };
  }

  async purchaseCharacter(userId: string, characterId: string) {
    const userIdObj = new Types.ObjectId(userId);
    const charIdObj = new Types.ObjectId(characterId);

    const character = await this.characterModel.findById(charIdObj);
    if (!character) throw new NotFoundException('Karakter tapılmadı');

    const user = await this.userModel.findById(userIdObj);
    if (!user) throw new NotFoundException('İstifadəçi tapılmadı');

    const balanceRounded = Math.round(user.balance * 10000);
    const priceRounded = Math.round(character.price * 10000);

    if (balanceRounded < priceRounded) {
      throw new BadRequestException(
        `Balansınız kifayət deyil. Balans: ${user.balance} AZN, Qiymət: ${character.price} AZN`,
      );
    }

    const updatedUser = await this.userModel.findByIdAndUpdate(
      userIdObj,
      {
        $inc: { balance: -character.price },
      },
      { new: true },
    );

    const newItem = new this.inventoryModel({
      userId: userIdObj,
      characterId: charIdObj,
      isEquipped: false,
    });
    const inventoryRecord = await newItem.save();

    return { inventoryRecord, balance: updatedUser?.balance };
  }

  async equipItem(userId: string, inventoryId: string) {
    const userIdObj = new Types.ObjectId(userId);
    const inventoryIdObj = new Types.ObjectId(inventoryId);

    const inventoryRecord = await this.inventoryModel
      .findOne({ _id: inventoryIdObj, userId: userIdObj })
      .populate('itemId')
      .populate('characterId')
      .exec();

    if (!inventoryRecord) throw new NotFoundException('İnventar tapılmadı');

    if (inventoryRecord.characterId) {
      // Unequip all other characters
      await this.inventoryModel.updateMany(
        { userId: userIdObj, characterId: { $exists: true }, isEquipped: true },
        { $set: { isEquipped: false } },
      );
    } else if (inventoryRecord.itemId) {
      const itemToEquip = inventoryRecord.itemId as unknown as FighterItem;

      const categoryNormalize: Record<string, string> = {
        helmet: 'dəbilqə',
        HELMET: 'dəbilqə',
        şlem: 'dəbilqə',
        armor: 'zireh',
        ARMOR: 'zireh',
        weapon: 'silah',
        WEAPON: 'silah',
        shield: 'qalxan',
        SHIELD: 'qalxan',
        boots: 'çəkmə',
        BOOTS: 'çəkmə',
        necklace: 'boyunbağı',
        NECKLACE: 'boyunbağı',
        pants: 'şalvar',
        PANTS: 'şalvar',
        gloves: 'əlcək',
        GLOVES: 'əlcək',
      };

      const normCat =
        categoryNormalize[itemToEquip.category] || itemToEquip.category;

      const userInventory = await this.inventoryModel
        .find({
          userId: userIdObj,
          isEquipped: true,
          itemId: { $exists: true },
        })
        .populate('itemId')
        .exec();

      for (const record of userInventory) {
        const equippedItem = record.itemId as unknown as FighterItem;
        if (!equippedItem) continue;

        const equippedNormCat =
          categoryNormalize[equippedItem.category] || equippedItem.category;

        if (equippedNormCat === normCat) {
          record.isEquipped = false;
          await record.save();
        }
      }
    }

    inventoryRecord.isEquipped = true;
    return inventoryRecord.save();
  }

  async unequipItem(userId: string, inventoryId: string) {
    const userIdObj = new Types.ObjectId(userId);
    const inventoryIdObj = new Types.ObjectId(inventoryId);

    const inventoryRecord = await this.inventoryModel.findOne({
      _id: inventoryIdObj,
      userId: userIdObj,
    });

    if (!inventoryRecord) throw new NotFoundException('İnventar tapılmadı');

    // If unequipping a character, ensure no character is equipped.
    // If unequipping an item, just unequip that specific item.
    if (inventoryRecord.characterId) {
      await this.inventoryModel.updateMany(
        { userId: userIdObj, characterId: { $exists: true }, isEquipped: true },
        { $set: { isEquipped: false } },
      );
    } else {
      inventoryRecord.isEquipped = false;
      await inventoryRecord.save();
    }

    // Return the updated state of the inventory record, or null if it was a character and all were unequipped.
    // For simplicity, we can just return the specific record that was targeted, now unequipped.
    // If it was a character, the above updateMany already handled it.
    // If it was an item, the specific record was updated.
    // So, we can just return the record with its new state.
    return inventoryRecord;
  }

  async claimProgressItem(userId: string, itemId: string) {
    const userIdObj = new Types.ObjectId(userId);
    const itemIdObj = new Types.ObjectId(itemId);

    const user = await this.userModel.findById(userIdObj);
    if (!user) throw new NotFoundException('İstifadəçi tapılmadı');

    const progress = user.itemProgress.get(itemId);
    if (progress === undefined) {
      throw new BadRequestException('Bu əşya üçün irəliləyiş tapılmadı');
    }

    if (progress < 100) {
      throw new BadRequestException(`İrəliləyiş kifayət deyil: ${progress}%`);
    }

    const item = await this.itemModel.findById(itemIdObj);
    if (!item) throw new NotFoundException('Əşya tapılmadı');

    // Add to inventory
    const newItem = new this.inventoryModel({
      userId: userIdObj,
      itemId: itemIdObj,
      isEquipped: false,
    });
    await newItem.save();

    // Remove from progress
    user.itemProgress.delete(itemId);
    await user.save();

    return { success: true, item };
  }
}
