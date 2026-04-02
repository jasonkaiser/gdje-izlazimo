package com.gdje_izlazimo.project.service;

import com.gdje_izlazimo.project.dto.request.update.UpdateUserRequest;
import com.gdje_izlazimo.project.dto.response.UserResponse;
import com.gdje_izlazimo.project.entity.User;
import com.gdje_izlazimo.project.enums.Role;
import com.gdje_izlazimo.project.exception.custom.UserNotFoundException;
import com.gdje_izlazimo.project.mapper.UserMapper;
import com.gdje_izlazimo.project.repository.UserRepository;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final KeycloakAdminService keycloakAdminService;
    private final UserMapper userMapper;

    public UserService(UserRepository userRepository, KeycloakAdminService keycloakAdminService, UserMapper userMapper) {
        this.userRepository = userRepository;
        this.keycloakAdminService = keycloakAdminService;
        this.userMapper = userMapper;
    }

    @Transactional
    @CacheEvict(value = {"dashboardStats"}, allEntries = true)
    public User getOrCreate(UUID id, String email, String username, String phoneNumber) {
        User user = userRepository.findById(id)
                .orElseGet(() -> {
                    User u = new User();
                    u.setId(id);
                    u.setRole(Role.USER);
                    return u;
                });

        if (email != null && !email.isBlank() && (user.getEmail() == null || user.getEmail().isBlank())) {
            user.setEmail(email.trim());
        }

        if (username != null && !username.isBlank() && (user.getName() == null || user.getName().isBlank())) {
            user.setName(username.trim());
        }

        if (phoneNumber != null && !phoneNumber.isBlank()) {
            user.setPhone(phoneNumber.trim());
        }

        return userRepository.save(user);
    }

    @Transactional
    public UserResponse getOrCreateResponse(UUID id, String email, String username, String phoneNumber) {
        return userMapper.toResponse(getOrCreate(id, email, username, phoneNumber));
    }

    @Transactional(readOnly = true)
    public UserResponse findUserById(UUID id) {
        User userEntity = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("User not found"));
        return userMapper.toResponse(userEntity);
    }

    @Transactional(readOnly = true)
    public List<UserResponse> findAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable).getContent()
                .stream()
                .map(userMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<UserResponse> findUserByRole(Role role, Pageable pageable) {
        return userRepository.findByRole(role, pageable).getContent()
                .stream()
                .map(userMapper::toResponse)
                .toList();
    }

    @Transactional
    public UserResponse updateUser(UUID id, UpdateUserRequest request) {
        User existingUser = userRepository.findById(id).orElseThrow(
                () -> new UserNotFoundException("User not found")
        );

        Role oldRole = existingUser.getRole();

        userMapper.updateEntity(existingUser, request);
        User updatedUser = userRepository.save(existingUser);

        if (request.role() != null && !request.role().equals(oldRole)) {
            keycloakAdminService.updateUserRole(
                    id,
                    oldRole.name().toLowerCase(),
                    request.role().name().toLowerCase()
            );
        }

        if (request.phone() != null) {
            keycloakAdminService.updateUserAttribute(id, "phone", request.phone());
        }

        return userMapper.toResponse(updatedUser);
    }

    @Transactional
    public UserResponse updateUserRole(UUID id, Role newRole) {
        User existingUser = userRepository.findById(id).orElseThrow(
                () -> new UserNotFoundException("User not found")
        );

        Role oldRole = existingUser.getRole();
        existingUser.setRole(newRole);
        userRepository.save(existingUser);

        keycloakAdminService.updateUserRole(
                id,
                oldRole.name().toLowerCase(),
                newRole.name().toLowerCase()
        );

        return userMapper.toResponse(existingUser);
    }

    @Transactional
    @CacheEvict(value = {"dashboardStats"}, allEntries = true)
    public void deleteUser(UUID id) {
        if (!userRepository.existsById(id)) {
            throw new UserNotFoundException("User not found");
        }
        userRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public UserResponse findByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found with email: " + email));
        return userMapper.toResponse(user);
    }
}