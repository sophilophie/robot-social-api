import {Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put} from '@nestjs/common';
import {PostService} from './post.service';
import {PostModel} from './entity/post.entity';
import {CreatePostDto} from './dto/create-post.dto';
import {UpdatePostDto} from './dto/update-post.dto';

@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Get(':userId')
  public getPostsByUserId(@Param('userId', ParseIntPipe) userId: number): Promise<PostModel[]> {
    return this.postService.getPostsByUserId(userId);
  }

  @Get('feed/:userId')
  public getNewsFeed(@Param('userId', ParseIntPipe) userId: number): Promise<PostModel[]> {
    return this.postService.getNewsFeedByUserId(userId);
  }

  @Post()
  public createPost(@Body() createPostDto: CreatePostDto): Promise<PostModel | null> {
    return this.postService.createPost(createPostDto);
  }

  @Delete(':postId')
  public deletePost(@Param('postId', ParseIntPipe) postId: number): Promise<PostModel> {
    return this.postService.deletePost(postId);
  }

  @Put(':postId')
  public updatePost(
    @Param('postId', ParseIntPipe) postId: number,
    @Body() updatePostDto: UpdatePostDto,
  ): Promise<PostModel> {
    return this.postService.updatePost(postId, updatePostDto);
  }
}
