import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ChatMessage, ChatMessageType } from './schemas/chat-message.schema';
import { User } from '../users/schemas/user.schema';

@Injectable()
export class ChatService {
  private lastMessageTime = new Map<string, number>();

  constructor(
    @InjectModel(ChatMessage.name) private chatModel: Model<ChatMessage>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async getMessages(userId?: string) {
    if (userId) {
      await this.userModel.findByIdAndUpdate(userId, {
        lastActivity: new Date(),
      });
    }
    return this.chatModel
      .find()
      .sort({ createdAt: -1 })
      .limit(30)
      .exec()
      .then((msgs) => msgs.reverse());
  }

  async getOnlineUsers() {
    const fifteenSecondsAgo = new Date(Date.now() - 15000);
    return this.userModel
      .find({ lastActivity: { $gte: fifteenSecondsAgo } })
      .select('name surname')
      .limit(20)
      .exec();
  }

  async postMessage(userId: string, message: string) {
    if (!message || message.trim().length === 0) {
      throw new BadRequestException('Mesaj boş ola bilməz');
    }

    if (message.length > 200) {
      // Increased for tagging
      throw new BadRequestException('Mesaj 200 simvoldan çox ola bilməz');
    }

    const user = await this.userModel.findById(userId);
    if (!user) throw new BadRequestException('İstifadəçi tapılmadı');

    // Update activity on post too
    user.lastActivity = new Date();
    await user.save();

    if (user.totalAnswered < 20) {
      throw new BadRequestException(
        'Mesaj yazmaq üçün minimum 20 sual tamamlamalısınız',
      );
    }

    const now = Date.now();
    const lastTime = this.lastMessageTime.get(userId) || 0;
    if (now - lastTime < 5000) {
      throw new BadRequestException(
        'Hər 5 saniyədə yalnız bir mesaj göndərə bilərsiniz',
      );
    }

    this.lastMessageTime.set(userId, now);

    const newMessage = new this.chatModel({
      userId: new Types.ObjectId(userId),
      username: `${user.name} ${user.surname}`,
      message,
      type: ChatMessageType.USER,
    });

    return newMessage.save();
  }

  async createSystemMessage(content: string) {
    const newMessage = new this.chatModel({
      username: 'Sistem',
      message: content,
      type: ChatMessageType.SYSTEM,
    });
    return newMessage.save();
  }
}
