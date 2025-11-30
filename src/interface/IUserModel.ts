export type UserRole = 'admin' | 'viewer' | 'editor';

export interface IUserModel {
  userId: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string | Date;
  updatedAt?: string | Date;
}

