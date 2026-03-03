import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { FighterItem } from './schemas/fighter-item.schema';
import { UserInventory } from './schemas/user-inventory.schema';
import { User } from '../users/schemas/user.schema';

@Injectable()
export class FighterService {
    constructor(
        @InjectModel(FighterItem.name) private itemModel: Model<FighterItem>,
        @InjectModel(UserInventory.name) private inventoryModel: Model<UserInventory>,
        @InjectModel(User.name) private userModel: Model<User>,
    ) { }

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

    // User methods
    async getShopItems() {
        return this.itemModel.find().sort({ level: 1 }).exec();
    }

    async getUserFighter(userId: string) {
        const userIdObj = new Types.ObjectId(userId);
        const inventory = await this.inventoryModel
            .find({ userId: userIdObj })
            .populate('itemId')
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
            throw new BadRequestException(`Balansınız kifayət deyil. Balans: ${user.balance} AZN, Qiymət: ${item.price} AZN`);
        }

        // Deduct balance atomically and get updated user
        const updatedUser = await this.userModel.findByIdAndUpdate(userIdObj, {
            $inc: { balance: -item.price }
        }, { new: true });

        // Add to inventory
        const newItem = new this.inventoryModel({
            userId: userIdObj,
            itemId: itemIdObj,
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
            .exec();

        if (!inventoryRecord) throw new NotFoundException('İnventar tapılmadı');

        const itemToEquip = inventoryRecord.itemId as unknown as FighterItem;

        // Unequip others in the same category
        const userInventory = await this.inventoryModel
            .find({ userId: userIdObj, isEquipped: true })
            .populate('itemId')
            .exec();

        for (const record of userInventory) {
            const equippedItem = record.itemId as unknown as FighterItem;
            if (equippedItem.category === itemToEquip.category) {
                record.isEquipped = false;
                await record.save();
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

        inventoryRecord.isEquipped = false;
        return inventoryRecord.save();
    }
}
