import { User } from './user';

export interface Root {
  token: string;
  user: User;
  message: string;
  statusCode: number;
}
