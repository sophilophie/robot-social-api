import * as request from 'supertest';
import {INestApplication} from '@nestjs/common';
import {Test} from '@nestjs/testing';
import {AppModule} from '../../src/app.module';
import {Repository} from 'typeorm';
import {UserModel} from '../../src/api/user/entity/user.entity';

let accessToken: string;
let userRepository: Repository<UserModel>;

describe('auth (e2e)', () => {
  let app: INestApplication;

  const testUser = {
    username: 'testAuth',
    firstName: 'test',
    lastName: 'auth',
    email: 'test@auth.com',
    password: 'testAuth01',
  };

  const expectedUser = {
    username: 'testAuth',
    firstName: 'test',
    lastName: 'auth',
    email: 'test@auth.com',
    id: 1,
    friendships: [],
    requestedFriends: [],
    requestsReceived: [],
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    userRepository = moduleRef.get('UserModelRepository');
    await app.init();
  });

  afterAll(async () => {
    await userRepository.query('TRUNCATE TABLE "user" RESTART IDENTITY CASCADE');
    await app.close();
  });

  it('POST /auth/login', () => {
    return request(app.getHttpServer())
      .post('/users')
      .send(testUser)
      .expect(201)
      .then(() => {
        return request(app.getHttpServer())
          .post('/auth/login')
          .send({username: 'testAuth', password: 'testAuth01'})
          .expect(201)
          .expect((res) => {
            accessToken = res.body.access_token as string;
            expect(res.body.user).toEqual(expectedUser);
          });
      });
  });

  it('POST /auth/refresh', () => {
    return request(app.getHttpServer())
      .post('/auth/refresh')
      .send({access_token: accessToken})
      .expect(201)
      .expect((res) => {
        expect(res.body.user).toEqual(expectedUser);
      });
  });
});
