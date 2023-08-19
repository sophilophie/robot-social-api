import {IsNotEmpty, IsNumber, IsString} from 'class-validator';

export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  public content: string;

  @IsNumber()
  @IsNotEmpty()
  public userId: number;
}
