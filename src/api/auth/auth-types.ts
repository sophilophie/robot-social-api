import { User } from "../user/entity/user.entity";

export interface JwtPayload {
  username: string;
  id: number;
}

export interface JwtResponse {
  access_token: string;
  user: User;
}