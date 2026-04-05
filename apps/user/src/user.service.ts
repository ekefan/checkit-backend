import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from './generated/prisma/client'
import { IUserRepository } from './user.repository';

@Injectable()
export class UserService {
  constructor(private readonly userRepo: IUserRepository) {}

  async createUser(data: {email: string, name: string}): Promise<User> {
    const user = await this.userRepo.createUser(data);
    return user
  }

  async getUserById(userId: string): Promise<User> {
    const user = await this.userRepo.getUserById(userId);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }
}
