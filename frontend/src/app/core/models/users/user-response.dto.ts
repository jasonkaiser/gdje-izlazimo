import { Role } from "./user-role.enum";


export interface UserResponseDto {
  id: string;          
  name: string;
  email: string;
  phone: string;
  role: Role;
  createdAt: string;   
  updatedAt: string;   

}