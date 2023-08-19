import * as request from 'supertest';
import {INestApplication} from '@nestjs/common';
import {Test} from '@nestjs/testing';
import {AppModule} from '../../src/app.module';
import {Repository} from 'typeorm';
import {UserModel} from '../../src/api/user/entity/user.entity';

let accessToken: string;
let userRepository: Repository<UserModel>;

describe('user (e2e)', () => {
  let app: INestApplication;
  const expectedUser = {
    username: 'TestUser1',
    firstName: 'test',
    lastName: 'user',
    email: 'test@email.com',
    id: 1,
  };

  const expectedUserAndFriends = {
    ...expectedUser,
    friends: [
      {
        username: 'TestUser2',
        firstName: 'test2',
        lastName: 'user2',
        email: 'test2@email.com',
        id: 2,
      },
    ],
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

  it('POST /users', () => {
    const newUserOne = {
      username: 'TestUser1',
      firstName: 'test',
      lastName: 'user',
      email: 'test@email.com',
      password: 'TestPassword01',
    };
    return request(app.getHttpServer())
      .post('/users')
      .send(newUserOne)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .expect(201)
      .expect((res) => {
        expect(res.body.user).toEqual(expectedUser);
        expect(res.body.access_token).toBeTruthy();
        accessToken = res.body.access_token as string;
      });
  });

  it('POST /users/friendship', () => {
    const newUserTwo = {
      username: 'TestUser2',
      firstName: 'test2',
      lastName: 'user2',
      email: 'test2@email.com',
      password: 'TestPassword01',
    };
    const newFriendship = {
      userId: 1,
      friendId: 2,
    };
    return request(app.getHttpServer())
      .post('/users')
      .send(newUserTwo)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .expect(201)
      .then(() => {
        return request(app.getHttpServer())
          .post('/users/friendship')
          .send(newFriendship)
          .set('Content-Type', 'application/json')
          .set('Accept', 'application/json')
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(201)
          .expect((res) => {
            expect(res.body).toEqual(expectedUserAndFriends);
          });
      });
  });

  it('GET /users/:id', () => {
    return request(app.getHttpServer())
      .get('/users/1')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toEqual(expectedUserAndFriends);
      });
  });

  it('GET /users', () => {
    const expectedUserTwo = {
      username: 'TestUser2',
      firstName: 'test2',
      lastName: 'user2',
      email: 'test2@email.com',
      id: 2,
    };
    return request(app.getHttpServer())
      .get('/users')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toEqual([expectedUser, expectedUserTwo]);
        expect(res.body instanceof Array).toBe(true);
      });
  });

  it('PUT /users/:id', () => {
    return request(app.getHttpServer())
      .put('/users/1')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({email: 'newTest@email.com'})
      .expect(200)
      .expect((res) => {
        expect(res.body).toEqual({
          ...expectedUserAndFriends,
          email: 'newTest@email.com',
        });
      });
  });

  it('DELETE /users/:id', () => {
    return request(app.getHttpServer())
      .delete('/users/2')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
      .then(() => {
        return request(app.getHttpServer()).get('/users/2').set('Authorization', `Bearer ${accessToken}`).expect(404);
      });
  });
});
