import {Test, TestingModule} from '@nestjs/testing';
import {RefreshUserDto} from '../user/dto/refresh-user.dto';
import {AuthController} from './auth.controller';
import {AuthService} from './auth.service';
import {LoginDto} from './dto/login.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let mockAuthService: any;

  const mockLoginDto: LoginDto = {
    username: 'testUser0',
    password: 'someHash',
  };

  const mockRefreshDto: RefreshUserDto = {
    access_token: 'SOME_HASH',
  };

  beforeEach(async () => {
    mockAuthService = {
      login: jest.fn(),
      refresh: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
    })
      .useMocker((token) => {
        if (token === AuthService) return mockAuthService;
      })
      .compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should invoke AuthService to do business logic', () => {
    controller.login(mockLoginDto);
    expect(mockAuthService.login).toHaveBeenCalled();
    controller.refresh(mockRefreshDto);
    expect(mockAuthService.refresh).toHaveBeenCalled();
  });
});
