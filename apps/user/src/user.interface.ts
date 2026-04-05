import { Observable } from 'rxjs';

export interface CreateUserRequest {
  email: string;
  name: string;
}

export interface GetUserByIdRequest {
  id: string;
}

export interface UserResponse {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface CreateUserResponse {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  walletId: string;
}

export interface UserServiceClient {
  createUser(data: CreateUserRequest): Observable<CreateUserResponse>;
  getUserById(data: GetUserByIdRequest): Observable<UserResponse>;
}