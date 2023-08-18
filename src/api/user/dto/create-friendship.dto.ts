import {IsNotEmpty, IsNumber} from 'class-validator';

export class CreateFriendshipDto {
  @IsNumber()
  @IsNotEmpty()
  public userId: number;

  @IsNumber()
  @IsNotEmpty()
  public friendId: number;
}
