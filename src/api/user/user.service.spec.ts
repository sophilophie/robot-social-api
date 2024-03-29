import {JwtService} from '@nestjs/jwt';
import {Test, TestingModule} from '@nestjs/testing';
import {Repository} from 'typeorm';
import {CreateUserDto} from './dto/create-user.dto';
import {UpdateUserDto} from './dto/update-user.dto';
import {UserModel} from './entity/user.entity';
import {UserService} from './user.service';
import {FriendRequestModel} from './entity/friend-request.entity';
import {FriendshipModel} from './entity/friendship.entity';

describe('UserService', () => {
  let service: UserService;
  let mockUserRepository: Partial<Repository<UserModel>>,
    mockJwtService: Partial<JwtService>,
    mockFriendRequestRepository: Partial<Repository<FriendRequestModel>>,
    mockFriendshipRepository: Partial<Repository<FriendshipModel>>;

  const mockUser: UserModel = {
    id: '0',
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

  const mockQueryBuilder = {
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    select: () => {
      return {
        // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
        where: () => {
          return {
            // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
            orWhere: () => {
              // eslint-disable-next-line @typescript-eslint/explicit-function-return-type, @typescript-eslint/no-empty-function
              return {getMany: () => {}};
            },
            // eslint-disable-next-line @typescript-eslint/explicit-function-return-type, @typescript-eslint/no-empty-function
            getMany: () => {},
          };
        },
      };
    },
  };

  beforeEach(async () => {
    mockUserRepository = {
      findOne: jest.fn().mockResolvedValue(mockUser),
      find: jest.fn().mockResolvedValue([mockUser]),
      save: jest.fn().mockResolvedValue({}),
      update: jest.fn(),
      remove: jest.fn(),
      query: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
    };
    mockJwtService = {
      sign: jest.fn(),
    };
    mockFriendRequestRepository = {
      query: jest.fn(),
      findOne: jest.fn(),
    };
    mockFriendshipRepository = {
      find: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserService],
    })
      .useMocker((token) => {
        if (token === 'UserModelRepository') return mockUserRepository;
        if (token === 'FriendRequestModelRepository') return mockFriendRequestRepository;
        if (token === 'FriendshipModelRepository') return mockFriendshipRepository;
        if (token === JwtService) return mockJwtService;
      })
      .compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should find one user by id', async () => {
    const result: UserModel | null = await service.getUser('0');
    expect(mockUserRepository.findOne).toHaveBeenCalled();
    expect(mockFriendshipRepository.find).toHaveBeenCalled();
    expect(result).toEqual(mockUser);
  });

  it('should throw 404 if user is not found in read, update, or destroy operations', async () => {
    mockUserRepository.findOne = jest.fn();
    try {
      await service.getUser('0');
    } catch (error) {
      expect(error.status).toBe(404);
    }

    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      await service.getUserByUsername('notFound');
    } catch (error) {
      expect(error.status).toBe(404);
    }

    try {
      await service.updateUser('0', {username: 'notFound'});
    } catch (error) {
      expect(error.status).toBe(404);
    }

    try {
      await service.deleteUser('0');
    } catch (error) {
      expect(error.status).toBe(404);
    }
  });

  it('should find one user by username', async () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const result: UserModel | null = await service.getUserByUsername('testUser0');
    expect(mockUserRepository.findOne).toHaveBeenCalled();
    expect(result).toEqual(mockUser);
  });

  it('should get a list of users', async () => {
    const result: UserModel[] = await service.getUsers();
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
    expect(mockUserRepository.findOne).toHaveBeenCalled();
    expect(mockUserRepository.save).toHaveBeenCalled();
    expect(mockJwtService.sign).toHaveBeenCalled();
  });

  it('should throw an error if user exists on create', async () => {
    try {
      await service.createUser(mockUser as CreateUserDto);
    } catch (error) {
      expect(error.status).toBe(409);
      expect(mockUserRepository.findOne).toHaveBeenCalled();
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    }
  });

  it('should update an existing user, returning the entire new user object', async () => {
    const updateUser: UpdateUserDto = {username: 'userName0'};
    await service.updateUser('0', updateUser);
    expect(mockUserRepository.findOne).toHaveBeenCalled();
    expect(mockUserRepository.update).toHaveBeenCalledWith('0', updateUser);
    expect(mockFriendshipRepository.find).toHaveBeenCalled();
  });

  it('should delete an existing user, reterning the deleted user', async () => {
    await service.deleteUser('0');
    expect(mockUserRepository.findOne).toHaveBeenCalled();
    expect(mockUserRepository.remove).toHaveBeenCalledWith(mockUser);
  });

  it('should search for users', async () => {
    await service.search('test user');
    expect(mockUserRepository.createQueryBuilder).toHaveBeenCalled();
  });
});
