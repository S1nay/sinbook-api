import { UserResponse } from 'src/user/responses/user.response';

export type AuthResponse = {
  user: UserResponse;
  access: string;
  refresh: string;
};
