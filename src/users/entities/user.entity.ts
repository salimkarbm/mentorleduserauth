import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { TimeStampWithDocument } from 'src/common/entity/timestamp.entity';
import { dbTimeStamp } from 'src/utils';

// Main User Schema
@Schema({
  id: true,
  timestamps: dbTimeStamp,
})
export class User extends TimeStampWithDocument {
  @Prop({ required: true })
  fullName: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true, select: false })
  password: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
