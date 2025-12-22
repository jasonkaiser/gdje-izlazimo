    package com.gdje_izlazimo.project.mapper;

    import com.gdje_izlazimo.project.dto.request.create.CreateUserRequest;
    import com.gdje_izlazimo.project.dto.request.update.UpdateUserRequest;
    import com.gdje_izlazimo.project.dto.response.UserResponse;
    import com.gdje_izlazimo.project.entity.User;

    public class UserMapper {

        public static User toEntity(CreateUserRequest dto){
            User user = new User();
            user.setName(dto.name());
            user.setEmail(dto.email());
            user.setPhone(dto.phone());
            user.setRole(dto.role());
            user.setPassword(dto.password());
            return user;
        }


        public static void updateEntity(User user, UpdateUserRequest dto){
            user.setName(dto.name());
            user.setPhone(dto.phone());
            user.setRole(dto.role());

        }

        public static UserResponse toResponse(User user) {
            return new UserResponse(
                    user.getId(),
                    user.getName(),
                    user.getEmail(),
                    user.getPhone(),
                    user.getRole(),
                    user.getCreated_at(),
                    user.getUpdated_at()
            );
        }
    }
