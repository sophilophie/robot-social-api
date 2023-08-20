import {IsNotEmpty, IsNumber} from 'class-validator';

export class CreateFriendshipDto {
  @IsNumber()
  @IsNotEmpty()
  public requestorId: number;

  @IsNumber()
  @IsNotEmpty()
  public requesteeId: number;
}
