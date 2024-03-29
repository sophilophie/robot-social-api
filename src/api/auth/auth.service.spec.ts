import {JwtService} from '@nestjs/jwt';
import {Test, TestingModule} from '@nestjs/testing';
import {UserService} from '../user/user.service';
import {AuthService} from './auth.service';
import {LoginDto} from './dto/login.dto';
import * as bcrypt from 'bcryptjs';
import {JwtResponse} from './auth-types';
import {UserModel} from '../user/entity/user.entity';

describe('AuthService', () => {
  let service: AuthService;
  let mockUserService: any, mockJwtService: any;

  const mockUser: UserModel = {
    id: 0,
    dateCreated: new Date(),
    dateUpdated: new Date(),
    firstName: 'Test',
    lastName: 'User',
    username: 'testUser0',
    password: 'someHash',
    email: 'test@user.com',
    friendships: [],
    posts: [],
    requestedFriends: [],
    requestsReceived: [],
  };

  const mockLogin: LoginDto = {
    username: 'testUser0',
    password: 'someHash',
  };

  beforeEach(async () => {
    mockUserService = {
      getUserByUsername: jest.fn().mockResolvedValue(mockUser),
      getUser: jest.fn().mockResolvedValue(mockUser),
      getUserAndFriendsbyUsername: jest.fn().mockResolvedValue(mockUser),
    };
    mockJwtService = {
      sign: jest.fn().mockReturnValue('JWT_TEST_HASH'),
      decode: jest.fn().mockReturnValue({id: 0, username: 'testUser0'}),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService],
    })
      .useMocker((token) => {
        if (token === UserService) return mockUserService;
        if (token === JwtService) return mockJwtService;
      })
      .compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should allow for a successful login', async () => {
    const expectedResult: JwtResponse = {
      access_token: 'JWT_TEST_HASH',
      user: mockUser,
    };
    (bcrypt as any).compareSync = jest.fn().mockResolvedValue(true);
    const result = await service.login(mockLogin);
    expect(mockJwtService.sign).toHaveBeenCalledWith({
      username: 'testUser0',
      id: 0,
    });
    expect(result).toEqual(expectedResult);
  });

  it("should throw unauthorized on login if passwords don't match", async () => {
    (bcrypt as any).compareSync = jest.fn().mockResolvedValue(false);
    try {
      await service.login(mockLogin);
    } catch (error) {
      expect(error.status).toBe(401);
    }
  });

  it('should throw unauthorized on login for bad tokens', async () => {
    mockUserService.getUserByUsername = jest.fn().mockResolvedValue(null);
    try {
      await service.login(mockLogin);
    } catch (error) {
      expect(error.status).toBe(401);
    }
  });

  it('should allow successful refresh calls', async () => {
    const expectedResult: any = {
      access_token: 'JWT_TEST_HASH',
      user: mockUser,
    };
    const result = await service.refresh({
      access_token: 'JWT_TEST_HASH_PRE_REFRESH',
    });
    expect(mockJwtService.decode).toHaveBeenCalledWith('JWT_TEST_HASH_PRE_REFRESH');
    expect(mockUserService.getUser).toHaveBeenCalledWith(0);
    expect(result).toEqual(expectedResult);
  });

  it('should not refresh on bad tokens', async () => {
    mockJwtService.decode = jest.fn().mockReturnValue(null);
    try {
      await service.refresh({access_token: 'JWT_TEST_HASH_BAD'});
    } catch (error) {
      expect(error).toBeTruthy();
    }
  });
});
