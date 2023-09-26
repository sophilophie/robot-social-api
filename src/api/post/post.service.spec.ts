import {Test, TestingModule} from '@nestjs/testing';
import {PostService} from './post.service';
import {Repository} from 'typeorm';
import {PostModel} from './entity/post.entity';
import {UserService} from '../user/user.service';

describe('PostService', () => {
  let service: PostService;
  let mockPostRepository: Partial<Repository<PostModel>>, mockUserService: Partial<UserService>;

  const mockPost = {
    id: 1,
    content: 'TestPost',
    timePosted: '2023-08-19T02:58:02.653Z',
  };

  const mockUser = {
    id: 0,
    dateCreated: new Date(),
    dateUpdated: new Date(),
    firstName: 'Test',
    lastName: 'User',
    username: 'testUser0',
    password: 'someHash',
    email: 'test@user.com',
    friends: [],
    posts: [],
  };

  beforeEach(async () => {
    mockPostRepository = {
      findOne: jest.fn().mockResolvedValue(mockPost),
      find: jest.fn().mockResolvedValue([mockPost]),
      save: jest.fn().mockResolvedValue(mockPost),
      update: jest.fn(),
      remove: jest.fn(),
    };

    mockUserService = {
      getUser: jest.fn().mockResolvedValue(mockUser),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [PostService],
    })
      .useMocker((token) => {
        if (token === 'PostModelRepository') return mockPostRepository;
        if (token === UserService) return mockUserService;
      })
      .compile();

    service = module.get<PostService>(PostService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should get posts by user id', async () => {
    await service.getPostsByUserId(1);
    expect(mockPostRepository.find).toHaveBeenCalled();
  });

  it('should create post', async () => {
    const createdPost = {
      content: 'TestPost',
      userId: 1,
    };
    await service.createPost(createdPost);
    expect(mockUserService.getUser).toHaveBeenCalled();
    expect(mockPostRepository.save).toHaveBeenCalled();
  });

  it('should delete post', async () => {
    await service.deletePost(1);
    expect(mockPostRepository.findOne).toHaveBeenCalled();
    expect(mockPostRepository.remove).toHaveBeenCalled();
  });

  it('should update post', async () => {
    await service.updatePost(1, {content: 'EditedTest'});
    expect(mockPostRepository.findOne).toHaveBeenCalled();
    expect(mockPostRepository.update).toHaveBeenCalled();
  });

  it('should get news feed', async () => {
    await service.getNewsFeedByUserId(1);
    expect(mockUserService.getUser).toHaveBeenCalled();
    expect(mockPostRepository.find).toHaveBeenCalled();
  });
});
