import { IsEmail, IsNotEmpty, IsString, IsDateString } from 'class-validator';
import { Transform } from 'class-transformer';
export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  name: string;
}
export class UserIdentityDto {
	@IsString()
	@IsNotEmpty()
  userId: string;
}

export class UserDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsDateString()
  @Transform(({ value }) => value.toISOString())
  createdAt: string;
}