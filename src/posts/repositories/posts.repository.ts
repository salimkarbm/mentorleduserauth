import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Post } from '../entities/post.entity';
import { BaseRepository } from '../../database/base.repository';

@Injectable()
export class PostsRepository extends BaseRepository<Post> {
  constructor(@InjectModel(Post.name) private readonly postModel: Model<Post>) {
    super(postModel);
  }
}
