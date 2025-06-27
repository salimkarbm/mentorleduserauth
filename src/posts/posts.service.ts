import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { LoggedInUser } from 'src/auth/dto/create-auth.dto';
import { PostsRepository } from './repositories/posts.repository';
import { FilterQuery, Model, Types } from 'mongoose';
import { FindType, PaginationResult } from 'src/database/base.repository';
import { Post } from './entities/post.entity';
import { ERROR_MESSAGES } from 'src/common/constant';
import { FilterAuthorDto } from './dto/filter-authors.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Post.name) private postModel: Model<Post>,
    private readonly postsRepository: PostsRepository,
  ) {}
  async createPost(createPostDto: CreatePostDto, user: LoggedInUser) {
    try {
      const post = await this.postsRepository.create({
        ...createPostDto,
        author: new Types.ObjectId(user.currentUserId),
      });
      return post;
    } catch (error) {
      if (error.code == 11000)
        throw new HttpException('Post already exist', HttpStatus.BAD_REQUEST);
      throw new BadRequestException('Error occur while creating post');
    }
  }

  async findAll(
    data: FilterQuery<Post>,
    options: FindType<Post> = {},
  ): Promise<PaginationResult<Post>> {
    return await this.postsRepository.findWithPagination(
      {},
      {
        page: data.page,
        limit: data.limit,
        search: data.search,
        populateOptions: [
          {
            path: 'author',
            model: 'User',
            select: 'fullName',
          },
        ],

        ...options,
      },
    );
  }

  async findAllAuthors(filterAuthorDto: FilterAuthorDto) {
    const page = filterAuthorDto.page ?? 1;
    const limit = filterAuthorDto.limit ?? 10;
    const distinctAuthorIds = await this.postModel.distinct('author');

    //Pagination is done in-memory on the array of unique IDs, which is fine unless the number of distinct authors is very large.
    const paginatedAuthorIds = distinctAuthorIds.slice(
      (page - 1) * limit,
      page * limit,
    );

    const authors = await this.userModel
      .find({ _id: { $in: paginatedAuthorIds } })
      .select('fullName')
      .lean();

    return {
      data: authors,
      total: distinctAuthorIds.length,
      currentPage: page,
      totalPages: Math.ceil(distinctAuthorIds.length / limit),
    };
  }

  async findOne(param: string) {
    const result = await this.postsRepository.findOne({
      _id: param,
    });
    if (!result) {
      throw new NotFoundException(ERROR_MESSAGES.POST_NOT_FOUND);
    }
    return result;
  }

  async update(
    param: string,
    updatePostDto: UpdatePostDto,
    user: LoggedInUser,
  ) {
    const post = await this.postsRepository.findOne({
      _id: param,
      author: new Types.ObjectId(user.currentUserId),
    });
    if (!post) {
      throw new NotFoundException(ERROR_MESSAGES.POST_NOT_FOUND);
    }
    const postData = {
      ...post.toJSON(),
      ...updatePostDto,
    };
    const updatePost = await this.postsRepository.update(
      { _id: param, author: new Types.ObjectId(user.currentUserId) },
      { $set: postData },
    );
    if (!updatePost) {
      throw new NotFoundException(ERROR_MESSAGES.POST_NOT_FOUND);
    }
    return updatePost;
  }

  async remove(param: string, user: LoggedInUser) {
    const post = await this.postsRepository.findOne({ _id: param });
    if (!post) {
      throw new NotFoundException(ERROR_MESSAGES.POST_NOT_FOUND);
    }
    return await this.postsRepository.deleteOne({
      _id: param,
      author: user.currentUserId,
    });
  }
}
