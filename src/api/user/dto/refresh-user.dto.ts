import {IsString, IsNotEmpty} from 'class-validator';

export class RefreshUserDto {
  @IsString()
  @IsNotEmpty()
  public access_token: string;
}
