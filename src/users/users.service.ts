import { Injectable } from '@nestjs/common';
import { LoggedInUser } from 'src/auth/dto/create-auth.dto';
import { UsersRepository } from './repositories/users.repository';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async user(filter: Record<string, string>) {
    return this.usersRepository.findOne(filter);
  }
  async createUser(user: Partial<User>) {
    return this.usersRepository.create(user);
  }
  async userProfile(user: LoggedInUser) {
    const result = await this.usersRepository.findOne({
      _id: user.currentUserId,
    });
    if (!result) {
      throw new Error('User not found');
    }
    return result;
  }
}
