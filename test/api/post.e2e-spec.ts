import * as request from 'supertest';
import {INestApplication} from '@nestjs/common';
import {Test} from '@nestjs/testing';
import {AppModule} from '../../src/app.module';
import {Repository} from 'typeorm';
import {UserModel} from '../../src/api/user/entity/user.entity';

let accessToken: string;
let userId: string;
let userTwoId: string;
let postId: string;
let userRepository: Repository<UserModel>;

describe('post (e2e)', () => {
  let app: INestApplication;
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

  it('POST /posts', () => {
    const newUser = {
      username: 'TestUser1',
      firstName: 'test',
      lastName: 'user',
      email: 'test@email.com',
      password: 'TestPassword01',
    };
    return request(app.getHttpServer())
      .post('/users')
      .send(newUser)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .expect(201)
      .expect((res) => {
        accessToken = res.body.access_token as string;
        userId = res.body.user.id as string;
      })
      .then(() => {
        return request(app.getHttpServer())
          .post('/posts')
          .send({
            content: 'Test Post',
            userId,
          })
          .set('Content-Type', 'application/json')
          .set('Accept', 'application/json')
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(201)
          .expect((res) => {
            expect(res.body.content).toBe('Test Post');
            expect(res.body.user.id).toBe(userId);
            postId = res.body.id as string;
          });
      });
  });

  it('GET /posts/:userId', () => {
    const newPostTwo = {
      content: 'Test Post Two',
      userId,
    };
    return request(app.getHttpServer())
      .post('/posts')
      .send(newPostTwo)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(201)
      .then(() => {
        return request(app.getHttpServer())
          .get(`/posts/${userId}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .expect((res) => {
            expect(res.body[0].content).toBe('Test Post Two');
            expect(res.body[1].content).toBe('Test Post');
          });
      });
  });

  it('GET /posts/feed/:userId', async () => {
    const newUserTwo = {
      username: 'TestUser2',
      firstName: 'Test',
      lastName: 'user',
      email: 'test2@email.com',
      password: 'TestPassword01',
    };
    await request(app.getHttpServer())
      .post('/users')
      .send(newUserTwo)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .expect(201)
      .expect((res) => {
        userTwoId = res.body.user.id as string;
      });
    await request(app.getHttpServer())
      .post('/users/friend-request')
      .send({requestorId: userId, requesteeId: userTwoId})
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(201);
    await request(app.getHttpServer())
      .post('/users/friendship')
      .send({requestorId: userId, requesteeId: userTwoId})
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(201);
    await request(app.getHttpServer())
      .post('/posts')
      .send({
        content: 'Test Post Three',
        userId: userTwoId,
      })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(201);
    await request(app.getHttpServer())
      .get(`/posts/feed/${userId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
      .expect((res) => {
        expect(res.body[0].user.id).toBe(userTwoId);
        expect(res.body[1].user.id).toBe(userId);
      });
  });

  it('PUT /posts/:postId', () => {
    const editedPost = {
      content: 'Edited Test Post',
    };
    return request(app.getHttpServer())
      .put(`/posts/${postId}`)
      .send(editedPost)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
      .then(() => {
        return request(app.getHttpServer())
          .get(`/posts/${userId}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(200)
          .expect((res) => {
            expect(res.body[0].content).toBe('Edited Test Post');
          });
      });
  });

  it('DELETE /posts/:postId', () => {
    return request(app.getHttpServer())
      .delete(`/posts/${postId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
      .then(() => {
        return request(app.getHttpServer())
          .get(`/posts/${userId}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(200)
          .expect((res) => {
            expect(res.body.length).toBe(1);
          });
      });
  });
});
