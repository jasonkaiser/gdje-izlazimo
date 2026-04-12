import { Role } from "./user-role.enum";


export interface UserResponseDto {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  profileImageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}