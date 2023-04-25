import { IsString, IsNotEmpty } from 'class-validator';

export class RefreshUserDto {
  @IsString()
  @IsNotEmpty()
  access_token: string;
}
