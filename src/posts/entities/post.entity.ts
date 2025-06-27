import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { dbTimeStamp } from 'src/utils';
import { TimeStampWithDocument } from 'src/common/entity/timestamp.entity';
import { User } from 'src/users/entities/user.entity';

@Schema()
export class Reply {
  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  user: Types.ObjectId;

  @Prop({ required: true })
  comment: string;

  @Prop({ default: false })
  edited: boolean;

  @Prop({ default: Date.now })
  createdAt: Date;
}

@Schema()
export class Comment {
  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  user: Types.ObjectId;

  @Prop({ required: true })
  comment: string;

  @Prop({ default: false })
  edited: boolean;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ type: [Reply], default: [] })
  replies: Reply[];
}

@Schema({
  timestamps: dbTimeStamp,
})
export class Post extends TimeStampWithDocument {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  content: string;

  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  author: Types.ObjectId;

  @Prop({ default: [] })
  tags: string[];

  @Prop({ default: false })
  isPublished: boolean;

  @Prop()
  publishedAt: Date;

  @Prop({ type: [Types.ObjectId], ref: User.name, default: [] })
  likes: Types.ObjectId[];

  @Prop({ type: [Comment], default: [] })
  comments: Comment[];
}

export const PostSchema = SchemaFactory.createForClass(Post);
