import {IsNotEmpty, IsNumber} from 'class-validator';

export class CreateFriendRequestDto {
  @IsNumber()
  @IsNotEmpty()
  public requestorId: number;

  @IsNumber()
  @IsNotEmpty()
  public requesteeId: number;
}
