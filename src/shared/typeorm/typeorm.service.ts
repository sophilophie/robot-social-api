import {Injectable} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {TypeOrmOptionsFactory, TypeOrmModuleOptions} from '@nestjs/typeorm';
import {PostModel} from '../../api/post/entity/post.entity';
import {UserModel} from '../../api/user/entity/user.entity';
import {FriendRequestModel} from '../../api/user/entity/friend-request.entity';
import {FriendshipModel} from '../../api/user/entity/friendship.entity';

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  constructor(private readonly config: ConfigService) {}

  public createTypeOrmOptions(): TypeOrmModuleOptions {
    if (process.env.NODE_ENV === 'test') {
      return {
        type: 'postgres',
        host: this.config.get<string>('DATABASE_HOST'),
        port: this.config.get<number>('DATABASE_PORT'),
        database: this.config.get<string>('DATABASE_NAME'),
        username: this.config.get<string>('DATABASE_USER'),
        password: this.config.get<string>('DATABASE_PASSWORD'),
        entities: [UserModel, PostModel, FriendRequestModel, FriendshipModel],
        migrations: ['dist/migrations/*.{ts,js}'],
        migrationsTableName: 'typeorm_migrations',
        logger: 'file',
        synchronize: true, // never use TRUE in production!
      };
    }
    return {
      type: 'postgres',
      host: this.config.get<string>('DATABASE_HOST'),
      port: this.config.get<number>('DATABASE_PORT'),
      database: this.config.get<string>('DATABASE_NAME'),
      username: this.config.get<string>('DATABASE_USER'),
      password: this.config.get<string>('DATABASE_PASSWORD'),
      entities: ['dist/**/*.entity.{ts,js}'],
      migrations: ['dist/migrations/*.{ts,js}'],
      migrationsTableName: 'typeorm_migrations',
      logger: 'file',
      synchronize: true, // never use TRUE in production!
    };
  }
}
