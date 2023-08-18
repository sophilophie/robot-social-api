import * as request from 'supertest';
import {INestApplication} from '@nestjs/common';
import {Test} from '@nestjs/testing';
import {AppService} from '../src/app.service';
import {AppModule} from '../src/app.module';

describe('app (e2e)', () => {
  let app: INestApplication;
  const mockAppService: AppService = {getHello: () => 'Hello test'};

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(AppService)
      .useValue(mockAppService)
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });
  afterAll(async () => {
    await app.close();
  });
  it('GET /', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect((res) => res.text === 'Hello test');
  });
});
