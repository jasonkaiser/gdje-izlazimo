package com.gdje_izlazimo.project.service;

import com.gdje_izlazimo.project.dto.request.update.UpdateUserRequest;
import com.gdje_izlazimo.project.dto.response.UserResponse;
import com.gdje_izlazimo.project.entity.User;
import com.gdje_izlazimo.project.enums.Role;
import com.gdje_izlazimo.project.exception.custom.UserNotFoundException;
import com.gdje_izlazimo.project.mapper.UserMapper;
import com.gdje_izlazimo.project.repository.UserRepository;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional
    public User getOrCreate(UUID id) {
        return userRepository.findById(id)
                .orElseGet(() -> {
                    User u = new User();
                    u.setId(id);
                    u.setRole(Role.USER);
                    return userRepository.save(u);
                });
    }


    @Transactional
    public User getOrCreate(UUID id, String emailFromKeycloak) {
        User user = userRepository.findById(id)
                .orElseGet(() -> {
                    User u = new User();
                    u.setId(id);
                    u.setRole(Role.USER);
                    return u;
                });

        if (emailFromKeycloak != null && !emailFromKeycloak.isBlank()) {
            String currentEmail = user.getEmail();
            if (currentEmail == null || currentEmail.isBlank()) {
                user.setEmail(emailFromKeycloak.trim());
            }
        }

        return userRepository.save(user);
    }

    @Transactional
    public UserResponse getOrCreateResponse(UUID id) {
        User user = getOrCreate(id);
        return UserMapper.toResponse(user);
    }

    @Transactional
    public UserResponse getOrCreateResponse(UUID id, String emailFromKeycloak) {
        User user = getOrCreate(id, emailFromKeycloak);
        return UserMapper.toResponse(user);
    }

    public UserResponse findUserById(UUID id) {
        User userEntity = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        return UserMapper.toResponse(userEntity);
    }

    public List<UserResponse> findAllUsers(Pageable pageable) {
        List<User> userEntity = userRepository.findAll(pageable).getContent();

        return userEntity.stream()
                .map(UserMapper::toResponse)
                .toList();
    }

    public List<UserResponse> findUserByRole(Role role, Pageable pageable) {
        List<User> userEntity = userRepository.findByRole(role, pageable).getContent();

        return userEntity.stream()
                .map(UserMapper::toResponse)
                .toList();
    }

    @Transactional
    public UserResponse updateUser(UUID id, UpdateUserRequest request) {
        User existingUser = userRepository.findById(id).orElseThrow(
                () -> new UserNotFoundException("User not found")
        );

        UserMapper.updateEntity(existingUser, request);
        User updatedUser = userRepository.save(existingUser);

        return UserMapper.toResponse(updatedUser);
    }

    @Transactional
    public void deleteUser(UUID id) {
        if (!userRepository.existsById(id)) {
            throw new UserNotFoundException("User not found");
        }
        userRepository.deleteById(id);
    }

    public UserResponse findByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));

        return UserMapper.toResponse(user);
    }
}
