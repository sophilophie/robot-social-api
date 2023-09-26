import {Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn} from 'typeorm';
import {PostModel} from '../../post/entity/post.entity';
import {FriendRequestModel} from './friend-request.entity';
import {FriendshipModel} from './friendship.entity';

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

  @OneToMany(() => PostModel, (post: PostModel) => post.user)
  public posts: PostModel[];

  @OneToMany(() => FriendshipModel, (friendship: FriendshipModel) => friendship.user || friendship.friend)
  public friendships: FriendshipModel[];

  @OneToMany(() => FriendRequestModel, (friendRequest: FriendRequestModel) => friendRequest.requestor)
  public requestedFriends: FriendRequestModel[];

  @OneToMany(() => FriendRequestModel, (friendRequest: FriendRequestModel) => friendRequest.requestee)
  public requestsReceived: FriendRequestModel[];
}
