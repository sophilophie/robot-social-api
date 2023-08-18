import {Exclude} from 'class-transformer';
import {Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn} from 'typeorm';

@Entity()
export class User {
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
  @Exclude()
  public password?: string;

  @ManyToMany(() => User)
  @JoinTable({joinColumn: {name: 'friendId'}})
  public friends: User[];
}
