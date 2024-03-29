import {Test, TestingModule} from '@nestjs/testing';
import {PostController} from './post.controller';
import {PostService} from './post.service';
import {JwtService} from '@nestjs/jwt';
import {UserService} from '../user/user.service';

describe('PostController', () => {
  let controller: PostController;
  let mockPostService: Partial<PostService>;

  const mockPost = {
    content: 'This is a test post',
    userId: '1',
  };
  beforeEach(async () => {
    mockPostService = {
      getPostsByUserId: jest.fn(),
      getNewsFeedByUserId: jest.fn(),
      createPost: jest.fn(),
      deletePost: jest.fn(),
      updatePost: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostController],
    })
      .useMocker((token) => {
        if (token === UserService) return {};
        if (token === JwtService) return {};
        if (token === PostService) return mockPostService;
      })
      .compile();

    controller = module.get<PostController>(PostController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should do business logic in post.service', () => {
    controller.createPost(mockPost);
    expect(mockPostService.createPost).toHaveBeenCalled();
    controller.getPostsByUserId('1');
    expect(mockPostService.getPostsByUserId).toHaveBeenCalled();
    controller.deletePost('1');
    expect(mockPostService.deletePost).toHaveBeenCalled();
    controller.updatePost('1', mockPost);
    expect(mockPostService.updatePost).toHaveBeenCalled();
    controller.getNewsFeed('1');
    expect(mockPostService.getNewsFeedByUserId).toHaveBeenCalled();
  });
});
