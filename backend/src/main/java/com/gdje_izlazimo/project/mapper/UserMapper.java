    package com.gdje_izlazimo.project.mapper;

    import com.gdje_izlazimo.project.dto.request.update.UpdateUserRequest;
    import com.gdje_izlazimo.project.dto.response.UserResponse;
    import com.gdje_izlazimo.project.entity.User;
    import org.mapstruct.BeanMapping;
    import org.mapstruct.Mapper;
    import org.mapstruct.MappingTarget;
    import org.mapstruct.NullValuePropertyMappingStrategy;

    @Mapper(componentModel = "spring")
    public interface UserMapper {



        @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
        void updateEntity(@MappingTarget User user, UpdateUserRequest dto);

        UserResponse toResponse(User user);

    }
