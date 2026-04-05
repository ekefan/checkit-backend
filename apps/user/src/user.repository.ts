import { User } from "./generated/prisma/client";

export abstract class IUserRepository {
  abstract createUser(data: { email: string; name: string }): Promise<User>;
  abstract getUserById(id: string): Promise<User | null>;
}