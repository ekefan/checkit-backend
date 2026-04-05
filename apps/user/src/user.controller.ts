import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './generated/prisma/client';
import { plainToClass } from 'class-transformer';
import { UserIdentityDto, UserDto, CreateUserDto } from './user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async create(@Body() req: CreateUserDto): Promise<UserDto> {
    const user = await this.userService.createUser(req);
    return this.mapToDto(user);
  }

  @Get()
  async get(@Query() req: UserIdentityDto): Promise<UserDto> {
    const user = await this.userService.getUserById(req.userId);
    return this.mapToDto(user);
  }

  private mapToDto(user: User): UserDto {
    return plainToClass(UserDto, {
      ...user,
    });
  }
}