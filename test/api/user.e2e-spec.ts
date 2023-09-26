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
    firstName: 'Test',
    lastName: 'User',
    email: 'test@email.com',
    id: 1,
  };

  const expectedUserAndFriends = {
    ...expectedUser,
    friendships: [
      {
        username: 'TestUser2',
        firstName: 'Test2',
        lastName: 'User2',
        email: 'test2@email.com',
        id: 2,
      },
    ],
    requestedFriends: [],
    requestsReceived: [],
    posts: [],
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
      firstName: 'Test',
      lastName: 'User',
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
        expect(res.body.user.id).toEqual(expectedUser.id);
        expect(res.body.user.username).toEqual(expectedUser.username);
        expect(res.body.user.firstName).toEqual(expectedUser.firstName);
        expect(res.body.user.lastName).toEqual(expectedUser.lastName);
        expect(res.body.user.email).toEqual(expectedUser.email);
        expect(res.body.access_token).toBeTruthy();
        accessToken = res.body.access_token as string;
      });
  });

  it('POST /users/friend-request', async () => {
    const friendRequest = {
      requestorId: 1,
      requesteeId: 2,
    };
    const newUserTwo = {
      username: 'TestUser2',
      firstName: 'Test2',
      lastName: 'User2',
      email: 'test2@email.com',
      password: 'TestPassword01',
    };

    await request(app.getHttpServer())
      .post('/users')
      .send(newUserTwo)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .expect(201);
    await request(app.getHttpServer())
      .post('/users/friend-request')
      .send(friendRequest)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(201);
    await request(app.getHttpServer())
      .get('/users/1')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.requestedFriends.length).toBe(1);
      });
  });

  it('POST /users/friendship', async () => {
    const newFriendship = {
      requestorId: 1,
      requesteeId: 2,
    };
    await request(app.getHttpServer())
      .post('/users/friendship')
      .send(newFriendship)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(201)
      .expect((res) => {
        expect(res.body.friendships[0].id).toBe(1);
      });
  });

  it('GET /users/:id', () => {
    return request(app.getHttpServer())
      .get('/users/1')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.friendships[0].id).toBe(1);
        expect(res.body.id).toBe(1);
      });
  });

  it('GET /users', () => {
    const expectedUserTwo = {
      username: 'TestUser2',
      firstName: 'Test2',
      lastName: 'User2',
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

  it('GET /users/search', () => {
    const expectedResponse = [
      {
        id: 1,
        username: 'TestUser1',
        firstName: 'Test',
        lastName: 'User',
        email: 'test@email.com',
      },
      {
        id: 2,
        username: 'TestUser2',
        firstName: 'Test2',
        lastName: 'User2',
        email: 'test2@email.com',
      },
    ];
    return request(app.getHttpServer())
      .get('/users/search?searchTerm=testuser')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toEqual(expectedResponse);
      });
  });

  it('PUT /users/:id', () => {
    return request(app.getHttpServer())
      .put('/users/1')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({email: 'newTest@email.com'})
      .expect(200)
      .expect((res) => {
        expect(res.body.email).toBe('newTest@email.com');
      });
  });

  it('DELETE /users/:id', () => {
    return request(app.getHttpServer())
      .delete('/users/1')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
      .then(() => {
        return request(app.getHttpServer()).get('/users/1').set('Authorization', `Bearer ${accessToken}`).expect(404);
      });
  });
});
