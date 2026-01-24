import { Role } from "./user-role.enum";

export interface CreateUserRequest {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: Role;
}
