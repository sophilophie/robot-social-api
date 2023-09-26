import {Column, Entity, ManyToOne, PrimaryGeneratedColumn} from 'typeorm';
import {UserModel} from './user.entity';

@Entity('friend_request')
export class FriendRequestModel {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column()
  public dateCreated: Date;

  @ManyToOne(() => UserModel, (user: UserModel) => user.requestedFriends, {
    onDelete: 'CASCADE',
  })
  public requestor: UserModel;

  @ManyToOne(() => UserModel, (user: UserModel) => user.requestsReceived, {
    onDelete: 'CASCADE',
  })
  public requestee: UserModel;
}
