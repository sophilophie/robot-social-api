import {Column, Entity, ManyToOne, PrimaryGeneratedColumn} from 'typeorm';
import {UserModel} from '../../user/entity/user.entity';

@Entity('post')
export class PostModel {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column('varchar', {length: 255})
  public content: string;

  @Column('timestamp')
  public timePosted: Date;

  @ManyToOne(() => UserModel, (user: UserModel) => user.posts)
  public user: UserModel;
}
