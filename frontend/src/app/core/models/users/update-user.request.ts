import { Role } from "./user-role.enum";

export interface UpdateUserRequest {
  name: string;
  phone: string;
  role: Role;
}
