import {IsNotEmpty, IsString, IsUUID} from 'class-validator';

export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  public content: string;

  @IsUUID()
  @IsNotEmpty()
  public userId: string;
}
