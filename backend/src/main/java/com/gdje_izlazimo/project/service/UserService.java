package com.gdje_izlazimo.project.service;

import com.gdje_izlazimo.project.dto.request.create.CreateUserRequest;
import com.gdje_izlazimo.project.dto.request.update.UpdateUserRequest;
import com.gdje_izlazimo.project.dto.response.UserResponse;
import com.gdje_izlazimo.project.entity.User;
import com.gdje_izlazimo.project.enums.Role;
import com.gdje_izlazimo.project.mapper.UserMapper;
import com.gdje_izlazimo.project.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
public class UserService {

    private final UserRepository userRepository;

    @Autowired
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public UserResponse findUserById(UUID id){

        User userEntity = userRepository.findById(id).
                orElseThrow( () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        return UserMapper.toResponse(userEntity);

    };

    public List<UserResponse> findAllUsers(){

        List<User> userEntity = userRepository.findAll();

        return userEntity.stream()
                .map(UserMapper::toResponse)
                .toList();

    }

    public List<UserResponse> findUserByRole(Role role){

        List<User> userEntity = userRepository.findByRole(role);

        return userEntity.stream()
                .map(UserMapper::toResponse)
                .toList();

    }

    public UserResponse createUser(CreateUserRequest user){

        if(userRepository.existsByEmail(user.email())){

            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already exists");

        }

        User newUser = UserMapper.toEntity(user);
        User savedUser = userRepository.save(newUser);

        return UserMapper.toResponse(savedUser);

    };

    public UserResponse updateUser(UUID id, UpdateUserRequest request){

        User existingUser = userRepository.findById(id).orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found")
        );

        UserMapper.updateEntity(existingUser, request);
        User updatedUser = userRepository.save(existingUser);

        return UserMapper.toResponse(updatedUser);

    }

    public void deleteUser(UUID id){

        if(!userRepository.existsById(id)){
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User does not exist");
        }

        userRepository.deleteById(id);
    }

}
