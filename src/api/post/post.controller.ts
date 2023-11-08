import {Body, Controller, Delete, Get, Param, Post, Put, UseGuards} from '@nestjs/common';
import {PostService} from './post.service';
import {PostModel} from './entity/post.entity';
import {CreatePostDto} from './dto/create-post.dto';
import {UpdatePostDto} from './dto/update-post.dto';
import {SameUserAuthGuard} from '../user/same-user-auth.guard';
import {UserOwnsPostGuard} from './user-owns-post.guard';

@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Get(':userId')
  public getPostsByUserId(@Param('userId') userId: string): Promise<PostModel[]> {
    return this.postService.getPostsByUserId(userId);
  }

  @UseGuards(SameUserAuthGuard)
  @Get('feed/:userId')
  public getNewsFeed(@Param('userId') userId: string): Promise<PostModel[]> {
    return this.postService.getNewsFeedByUserId(userId);
  }

  @Post()
  public createPost(@Body() createPostDto: CreatePostDto): Promise<PostModel | null> {
    return this.postService.createPost(createPostDto);
  }

  @UseGuards(UserOwnsPostGuard)
  @Delete(':postId')
  public deletePost(@Param('postId') postId: string): Promise<PostModel> {
    return this.postService.deletePost(postId);
  }

  @UseGuards(UserOwnsPostGuard)
  @Put(':postId')
  public updatePost(@Param('postId') postId: string, @Body() updatePostDto: UpdatePostDto): Promise<PostModel> {
    return this.postService.updatePost(postId, updatePostDto);
  }
}
