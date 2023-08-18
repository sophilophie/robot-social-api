import * as request from 'supertest';
import {INestApplication} from '@nestjs/common';
import {Test} from '@nestjs/testing';
import {AppModule} from '../../src/app.module';

let accessToken: string;

describe('user (e2e)', () => {
  let app: INestApplication;
  const expectedResponseUser = {
    username: 'TestUser0',
    firstName: 'test',
    lastName: 'user',
    email: 'test@email.com',
    id: 1,
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /users', () => {
    const payload = {
      username: 'TestUser0',
      firstName: 'test',
      lastName: 'user',
      email: 'test@email.com',
      password: 'TestPassword01',
    };
    return request(app.getHttpServer())
      .post('/users')
      .send(payload)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .expect(201)
      .expect((res) => {
        expect(res.body.user).toEqual(expectedResponseUser);
        expect(res.body.access_token).toBeTruthy();
        accessToken = res.body.access_token as string;
      });
  });

  it('GET /users/:id', () => {
    return request(app.getHttpServer())
      .get('/users/1')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toEqual(expectedResponseUser);
      });
  });

  it('GET /users', () => {
    return request(app.getHttpServer())
      .get('/users')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toEqual([expectedResponseUser]);
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
          ...expectedResponseUser,
          email: 'newTest@email.com',
        });
      });
  });

  it('DELETE /users/:id', () => {
    const testUserTwo = {
      username: 'Tester2',
      firstName: 'test',
      lastName: 'user',
      email: 'test2@email.com',
      password: 'password',
    };
    return request(app.getHttpServer())
      .post('/users')
      .send(testUserTwo)
      .expect(201)
      .then(() => {
        return request(app.getHttpServer())
          .delete('/users/2')
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(200)
          .then(() => {
            return request(app.getHttpServer())
              .get('/users/2')
              .set('Authorization', `Bearer ${accessToken}`)
              .expect(404);
          });
      });
  });
});
