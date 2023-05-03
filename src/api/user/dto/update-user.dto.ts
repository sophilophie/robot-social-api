import {IsEmail, IsOptional, IsString} from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  public username?: string;

  @IsOptional()
  @IsString()
  public firstName?: string;

  @IsOptional()
  @IsString()
  public lastName?: string;

  @IsOptional()
  @IsEmail()
  public email?: string;
}
