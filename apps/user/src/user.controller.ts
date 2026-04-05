import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { UserService } from './user.service';
import type { CreateUserRequest, GetUserByIdRequest, UserResponse, CreateUserResponse} from './user.interface'
import { CreateUserDto } from './user.dto';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

@GrpcMethod('UserService', 'CreateUser')
async createUser(data: CreateUserDto): Promise<CreateUserResponse> {
  return this.userService.createUser(data);
}

  @GrpcMethod('UserService', 'GetUserById')
  async getUserById(data: GetUserByIdRequest): Promise<UserResponse> {
    return this.userService.getUserById(data.id);
  }
}