import {JwtService} from '@nestjs/jwt';
import {Test, TestingModule} from '@nestjs/testing';
import {Repository} from 'typeorm';
import {CreateUserDto} from './dto/create-user.dto';
import {UpdateUserDto} from './dto/update-user.dto';
import {User} from './entity/user.entity';
import {UserService} from './user.service';

describe('UserService', () => {
  let service: UserService;
  let mockUserRepository: Partial<Repository<User>>, mockJwtService: Partial<JwtService>;

  const mockUser: User = {
    id: 0,
    firstName: 'Test',
    lastName: 'User',
    username: 'testUser0',
    password: 'someHash',
    email: 'test@user.com',
    friends: [],
  };

  beforeEach(async () => {
    mockUserRepository = {
      findOne: jest.fn().mockResolvedValue(mockUser),
      find: jest.fn().mockResolvedValue([mockUser]),
      save: jest.fn().mockResolvedValue({}),
      update: jest.fn(),
      remove: jest.fn(),
      query: jest.fn(),
    };
    mockJwtService = {
      sign: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserService],
    })
      .useMocker((token) => {
        if (token === 'UserRepository') return mockUserRepository;
        if (token === JwtService) return mockJwtService;
      })
      .compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should find one user by id', async () => {
    const result: User | null = await service.getUser(0);
    expect(mockUserRepository.findOne).toHaveBeenCalledWith({where: {id: 0}});
    expect(mockUserRepository.query).toHaveBeenCalled();
    expect(result).toEqual(mockUser);
  });

  it('should throw 404 if user is not found in read, update, or destroy operations', async () => {
    mockUserRepository.findOne = jest.fn();
    try {
      await service.getUser(0);
    } catch (error) {
      expect(error.status).toBe(404);
    }

    try {
      await service.getUserByUsername('notFound');
    } catch (error) {
      expect(error.status).toBe(404);
    }

    try {
      await service.updateUser(0, {username: 'notFound'});
    } catch (error) {
      expect(error.status).toBe(404);
    }

    try {
      await service.deleteUser(0);
    } catch (error) {
      expect(error.status).toBe(404);
    }
  });

  it('should find one user by username', async () => {
    const result: User | null = await service.getUserByUsername('testUser0');
    expect(mockUserRepository.findOne).toHaveBeenCalledWith({
      where: {username: 'testUser0'},
    });
    expect(result).toEqual(mockUser);
  });

  it('should get a list of users', async () => {
    const result: User[] = await service.getUsers();
    expect(mockUserRepository.find).toHaveBeenCalled();
    expect(result).toEqual([mockUser]);
  });

  it('should create a new user', async () => {
    mockUserRepository.findOne = jest.fn().mockResolvedValue(Promise.resolve());
    const createdUser: CreateUserDto = {
      firstName: 'Tester',
      lastName: 'Usecase',
      username: 'testerUsecase1',
      email: 'tester@usecase.com',
      password: 'someOtherHash',
    };
    await service.createUser(createdUser);
    expect(mockUserRepository.findOne).toHaveBeenCalledWith({
      where: {username: 'testerUsecase1'},
    });
    expect(mockUserRepository.save).toHaveBeenCalled();
    expect(mockJwtService.sign).toHaveBeenCalled();
  });

  it('should throw an error if user exists on create', async () => {
    try {
      await service.createUser(mockUser as CreateUserDto);
    } catch (error) {
      expect(error.status).toBe(409);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: {username: 'testUser0'},
      });
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    }
  });

  it('should update an existing user, returning the entire new user object', async () => {
    const updateUser: UpdateUserDto = {username: 'userName0'};
    const result: User = await service.updateUser(0, updateUser);
    expect(mockUserRepository.findOne).toHaveBeenCalledWith({where: {id: 0}});
    expect(mockUserRepository.query).toHaveBeenCalled();
    expect(mockUserRepository.update).toHaveBeenCalledWith(0, updateUser);
    expect(result).toEqual({...mockUser, username: 'userName0'});
  });

  it('should delete an existing user, reterning the deleted user', async () => {
    await service.deleteUser(0);
    expect(mockUserRepository.findOne).toHaveBeenCalledWith({where: {id: 0}});
    expect(mockUserRepository.remove).toHaveBeenCalledWith(mockUser);
  });
});
