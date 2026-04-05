import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { IUserRepository } from './user.repository';
import { User, Prisma } from './generated/prisma/client';

@Injectable()
export class UserPrismaRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createUser(data: { email: string; name: string }): Promise<User> {
    try {
      const user = await this.prisma.user.create({
        data,
      });
      return user;
    } catch (error) {
      Logger.log(`error creating user, details:${error}`)
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('User with this email already exists');
      }
      throw new InternalServerErrorException('Failed to create user');
    }
  }

	async getUserById(id: string): Promise<User | null> {
		try {
			const user = await this.prisma.user.findUnique({
				where: { id },
			});

			if (!user) throw new NotFoundException('No user known with this id');
      Logger.log(`fetched user with id: ${id}`)
			return user;
		} catch (error) {
      Logger.log(`error fetching user with id: ${id}`)
			if (error instanceof NotFoundException) throw error;
			throw new InternalServerErrorException('Failed to fetch user');
		}
	}
}