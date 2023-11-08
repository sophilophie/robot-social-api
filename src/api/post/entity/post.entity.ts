import {Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn} from 'typeorm';
import {UserModel} from '../../user/entity/user.entity';

@Entity('post')
export class PostModel {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column('varchar', {length: 255})
  public content: string;

  @CreateDateColumn()
  public dateCreated: Date;

  @UpdateDateColumn()
  public dateUpdated: Date;

  @ManyToOne(() => UserModel, (user: UserModel) => user.posts)
  public user: UserModel;
}
