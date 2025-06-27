import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { GetUser } from 'src/common/decorator/user.decorator';
import { LoggedInUser } from 'src/auth/dto/create-auth.dto';
import { Response } from 'express';
import { HttpResponse } from 'src/utils';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from 'src/common/constant';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FilterPostDto } from './dto/filter-post.dto';
import { GetPostDto } from './dto/fetch-post.dto';

@Controller('v1/posts')
@ApiTags('v1/posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}
  @Post()
  @ApiOperation({ summary: 'Create Post' })
  @ApiBearerAuth() // This indicates that the endpoint requires a Bearer token
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: SUCCESS_MESSAGES.POST_CREATED,
  })
  @ApiBadRequestResponse({ description: ERROR_MESSAGES.UNAUTHORIZED })
  async create(
    @Body() createPostDto: CreatePostDto,
    @Res() response: Response,
    @GetUser() user: LoggedInUser,
  ) {
    const result = await this.postsService.createPost(createPostDto, user);
    return HttpResponse({
      message: SUCCESS_MESSAGES.POST_CREATED,
      data: result,
      status: HttpStatus.CREATED,
      response,
    });
  }

  @Get()
  @ApiOperation({ summary: 'Get all posts' })
  @ApiBearerAuth()
  @ApiResponse({
    status: HttpStatus.OK,
    description: SUCCESS_MESSAGES.POST_FETCHED,
  })
  @ApiBadRequestResponse({ description: ERROR_MESSAGES.POST_NOT_FOUND })
  async findAll(
    @Res() response: Response,
    @Query() filterPostDto: FilterPostDto,
  ) {
    const result = await this.postsService.findAll(filterPostDto);
    return HttpResponse({
      message: SUCCESS_MESSAGES.POST_FETCHED,
      data: result,
      status: HttpStatus.OK,
      response,
    });
  }

  @Get('/authors')
  @ApiOperation({ summary: 'Get all Authors' })
  @ApiBearerAuth()
  @ApiResponse({
    status: HttpStatus.OK,
    description: SUCCESS_MESSAGES.AUTHORS_FETCHED,
  })
  @ApiBadRequestResponse({ description: ERROR_MESSAGES.POST_NOT_FOUND })
  async findAllAuthors(
    @Res() response: Response,
    @Query() filterPostDto: FilterPostDto,
  ) {
    const result = await this.postsService.findAllAuthors(filterPostDto);
    return HttpResponse({
      message: SUCCESS_MESSAGES.AUTHORS_FETCHED,
      data: result,
      status: HttpStatus.OK,
      response,
    });
  }

  @Get('/:postId')
  @ApiOperation({ summary: 'Get single post' })
  @ApiBearerAuth()
  @ApiResponse({
    status: HttpStatus.OK,
    description: SUCCESS_MESSAGES.POST_FETCHED,
  })
  @ApiBadRequestResponse({ description: ERROR_MESSAGES.POST_NOT_FOUND })
  async findOne(@Param() param: GetPostDto, @Res() response: Response) {
    const result = await this.postsService.findOne(param.postId);
    return HttpResponse({
      message: SUCCESS_MESSAGES.POST_FETCHED,
      data: result,
      status: HttpStatus.OK,
      response,
    });
  }

  @Patch('/:postId')
  @ApiOperation({ summary: 'Update post' })
  @ApiBearerAuth()
  @ApiResponse({
    status: HttpStatus.OK,
    description: SUCCESS_MESSAGES.POST_UPDATED,
  })
  @ApiBadRequestResponse({ description: ERROR_MESSAGES.POST_NOT_FOUND })
  async update(
    @Param() param: GetPostDto,
    @Res() response: Response,
    @Body() updatePostDto: UpdatePostDto,
    @GetUser() user: LoggedInUser,
  ) {
    const result = await this.postsService.update(
      param.postId,
      updatePostDto,
      user,
    );
    return HttpResponse({
      message: SUCCESS_MESSAGES.POST_UPDATED,
      data: result,
      status: HttpStatus.OK,
      response,
    });
  }

  @Delete('/:postId')
  @ApiOperation({ summary: 'Delete single post' })
  @ApiBearerAuth()
  @ApiResponse({
    status: HttpStatus.OK,
    description: SUCCESS_MESSAGES.POST_DELETED,
  })
  @ApiBadRequestResponse({ description: ERROR_MESSAGES.POST_NOT_FOUND })
  async remove(
    @Param() param: GetPostDto,
    @Res() response: Response,
    @GetUser() user: LoggedInUser,
  ) {
    const result = await this.postsService.remove(param.postId, user);
    return HttpResponse({
      message: SUCCESS_MESSAGES.POST_DELETED,
      data: result,
      status: HttpStatus.OK,
      response,
    });
  }
}
