import {Column, Entity, ManyToOne, PrimaryGeneratedColumn} from 'typeorm';
import {UserModel} from './user.entity';

@Entity('friendship')
export class FriendshipModel {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column()
  public dateCreated: Date;

  @ManyToOne(() => UserModel, (user: UserModel) => user.friendships, {
    onDelete: 'CASCADE',
  })
  public user: UserModel;

  @ManyToOne(() => UserModel, (user: UserModel) => user.friendships, {
    onDelete: 'CASCADE',
  })
  public friend: UserModel;
}
