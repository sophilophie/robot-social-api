import {Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn} from 'typeorm';
import {PostModel} from '../../post/entity/post.entity';
import {FriendRequestModel} from './friend-request.entity';

@Entity('user')
export class UserModel {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column({unique: true})
  public username: string;

  @Column()
  public firstName: string;

  @Column()
  public lastName: string;

  @Column({unique: true})
  public email: string;

  @Column()
  public password?: string;

  @ManyToMany(() => UserModel)
  @JoinTable({joinColumn: {name: 'friendId'}})
  public friends: UserModel[];

  @OneToMany(() => PostModel, (post: PostModel) => post.user)
  public posts: PostModel[];

  @OneToMany(() => FriendRequestModel, (friendRequest: FriendRequestModel) => friendRequest.requestor)
  public requestedFriends: FriendRequestModel[];

  @OneToMany(() => FriendRequestModel, (friendRequest: FriendRequestModel) => friendRequest.requestee)
  public requestsReceived: FriendRequestModel[];
}
