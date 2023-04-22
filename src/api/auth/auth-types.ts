export interface JwtPayload {
  username: string;
  id: number;
}

export interface JwtResponse {
  access_token: string;
}