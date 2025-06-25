import { User } from '../../users/entities/user.entity';

export class LoggedInUser extends User {
  currentUserRole: string;
  currentUserId: string;
}
