import {IsNotEmpty, IsUUID} from 'class-validator';

export class CreateFriendRequestDto {
  @IsUUID()
  @IsNotEmpty()
  public requestorId: string;

  @IsUUID()
  @IsNotEmpty()
  public requesteeId: string;
}
