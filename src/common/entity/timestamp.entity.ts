import { Prop } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export class TimeStampWithDocument extends Document {
  @Prop({ select: false })
  createdAt?: Date;

  @Prop({ select: false })
  updatedAt?: Date;

  @Prop({ select: false })
  __v?: number;
}
