import {IsNotEmpty, IsUUID} from 'class-validator';

export class CreateFriendshipDto {
  @IsUUID()
  @IsNotEmpty()
  public requestorId: string;

  @IsUUID()
  @IsNotEmpty()
  public requesteeId: string;
}
