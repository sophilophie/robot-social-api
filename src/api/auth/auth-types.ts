import {UserModel} from '../user/entity/user.entity';

export interface JwtPayload {
  username: string;
  id: string;
}

export interface JwtResponse {
  access_token: string;
  user: UserModel;
}
