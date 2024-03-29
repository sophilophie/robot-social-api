import {Injectable, NotFoundException} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {PostModel} from './entity/post.entity';
import {CreatePostDto} from './dto/create-post.dto';
import {UserService} from '../user/user.service';
import {UpdatePostDto} from './dto/update-post.dto';
import * as _ from 'lodash';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(PostModel)
    private readonly postRepository: Repository<PostModel>,
    private readonly userService: UserService,
  ) {}

  public async getPostsByUserId(userId: string): Promise<PostModel[]> {
    const userPosts = await this.postRepository.find({where: {user: {id: userId}}});
    return _.orderBy(userPosts, ['dateUpdated'], ['desc']);
  }

  public async createPost(createPostDto: CreatePostDto): Promise<PostModel> {
    const postUser = await this.userService.getUser(createPostDto.userId);
    if (postUser) {
      const newPost = new PostModel();
      newPost.content = createPostDto.content;
      newPost.user = postUser;
      const createdPost = await this.postRepository.save(newPost);
      delete createdPost?.user?.password;
      return createdPost;
    }
    throw new NotFoundException();
  }

  public async deletePost(postId: string): Promise<PostModel> {
    const deletePost = await this.postRepository.findOne({where: {id: postId}});
    if (deletePost) {
      return this.postRepository.remove(deletePost);
    }
    throw new NotFoundException();
  }

  public async updatePost(postId: string, updatePostDto: UpdatePostDto): Promise<PostModel> {
    const updatePost = await this.postRepository.findOne({where: {id: postId}});
    if (updatePost) {
      await this.postRepository.update(postId, updatePostDto);
      return {...updatePost, ...updatePostDto};
    }
    throw new NotFoundException();
  }

  public async getNewsFeedByUserId(userId: string): Promise<PostModel[]> {
    let newsFeed: PostModel[] = [];
    const requestingUser = await this.userService.getUser(userId);
    _.forEach(requestingUser?.friendships, async (friendships) => {
      const friendPosts = await this.postRepository.find({
        where: {user: {id: friendships.friend?.id}},
        relations: {user: true},
      });
      newsFeed = newsFeed.concat(friendPosts);
    });
    const requestingUserPosts = await this.postRepository.find({where: {user: {id: userId}}, relations: {user: true}});
    newsFeed = newsFeed.concat(requestingUserPosts);
    newsFeed = _.orderBy(newsFeed, ['dateUpdated'], ['desc']);
    return newsFeed;
  }
}
