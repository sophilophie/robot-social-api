import { IsEmail, IsString } from "class-validator";

export class UpdateUserDto {
  @IsString()
  username?: string;

  @IsString()
  firstName?: string;

  @IsString()
  lastName?: string;

  @IsEmail()
  email?: string;
}