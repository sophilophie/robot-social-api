import {Test, TestingModule} from '@nestjs/testing';
import {CreateUserDto} from './dto/create-user.dto';
import {UpdateUserDto} from './dto/update-user.dto';
import {UserController} from './user.controller';
import {UserService} from './user.service';
import {JwtService} from '@nestjs/jwt';

describe('UserController', () => {
  let controller: UserController;
  let mockUserService: any;

  const testCreateUserDto: CreateUserDto = {
    username: 'testUser',
    firstName: 'test',
    lastName: 'test',
    email: 'test@test.com',
    password: 'someHash',
  };

  const testPutUserDto: UpdateUserDto = {
    username: 'testUser0',
  };

  beforeEach(async () => {
    mockUserService = {
      getUsers: jest.fn(),
      getUserWithFriends: jest.fn(),
      createUser: jest.fn(),
      updateUser: jest.fn(),
      deleteUser: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
    })
      .useMocker((token) => {
        if (token === JwtService) return {};
        if (token === UserService) return mockUserService;
      })
      .compile();

    controller = module.get<UserController>(UserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should invoke UserService to do business logic', () => {
    controller.getUsers();
    expect(mockUserService.getUsers).toHaveBeenCalled();
    controller.getUser(0);
    expect(mockUserService.getUserWithFriends).toHaveBeenCalledWith(0);
    controller.postUser(testCreateUserDto);
    expect(mockUserService.createUser).toHaveBeenCalledWith(testCreateUserDto);
    controller.putUser(0, testPutUserDto);
    expect(mockUserService.updateUser).toHaveBeenCalledWith(0, testPutUserDto);
    controller.deleteUser(0);
    expect(mockUserService.deleteUser).toHaveBeenCalledWith(0);
  });
});
