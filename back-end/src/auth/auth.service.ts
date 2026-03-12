import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcryptjs';
import { ActivityService } from '../activity/activity.service';
import { ActivityType } from '../activity/schemas/activity.schema';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private activityService: ActivityService,
  ) {}

  async register(userData: any) {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const user = await this.usersService.create({
      ...userData,
      password: hashedPassword,
    });

    // Log activity
    await this.activityService.log(
      user._id.toString(),
      `${user.name} ${user.surname}`,
      ActivityType.REGISTER,
      'Sistemdə qeydiyyatdan keçdi',
    );

    return this.login(user);
  }

  async login(user: any) {
    const payload = {
      sub: user._id,
      role: user.role,
      name: user.name,
      surname: user.surname,
      fatherName: user.fatherName,
      email: user.email,
      grade: user.grade,
    };

    // Log activity (only for students, admins might clutter)
    await this.activityService.log(
      user._id.toString(),
      `${user.name} ${user.surname}`,
      ActivityType.LOGIN,
      'Sistemə giriş etdi',
    );

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user._id,
        name: user.name,
        surname: user.surname,
        fatherName: user.fatherName,
        role: user.role,
        balance: user.balance,
        level: user.level,
        correctAnswers: user.correctAnswers,
        wrongAnswers: user.wrongAnswers,
        totalAnswered: user.totalAnswered,
        quizStartTimes: user.quizStartTimes,
        restEndTimes: user.restEndTimes,
        levelProgress: user.levelProgress,
        levelSessionWrongAnswers: user.levelSessionWrongAnswers,
        totalBattlesWon: user.totalBattlesWon,
      },
    };
  }

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneByEmail(email);
    if (user && (await bcrypt.compare(pass, user.password))) {
      return user;
    }
    return null;
  }
}
