import {Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn} from 'typeorm';
import {PostModel} from '../../post/entity/post.entity';

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

  @Column({select: false})
  public password?: string;

  @ManyToMany(() => UserModel)
  @JoinTable({joinColumn: {name: 'friendId'}})
  public friends: UserModel[];

  @OneToMany(() => PostModel, (post: PostModel) => post.user)
  public posts: PostModel[];
}
