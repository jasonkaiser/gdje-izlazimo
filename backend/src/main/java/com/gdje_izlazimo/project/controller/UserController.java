package com.gdje_izlazimo.project.controller;

import com.gdje_izlazimo.project.dto.request.update.UpdateUserRequest;
import com.gdje_izlazimo.project.dto.response.UserResponse;
import com.gdje_izlazimo.project.enums.Role;
import com.gdje_izlazimo.project.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/users")
public class UserController {

    private final UserService userService;

    @Autowired
    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> findUserById(@PathVariable UUID id) {
        return ResponseEntity.ok(userService.findUserById(id));
    }

    @PreAuthorize("hasRole('admin')")
    @GetMapping
    public ResponseEntity<List<UserResponse>> findAllUsers(@RequestParam(defaultValue = "1") int pageNo,
                                                           @RequestParam(defaultValue = "10") int pageSize,
                                                           @RequestParam(required = false) Role role,
                                                           @RequestParam(defaultValue = "id") String sortBy,
                                                           @RequestParam(defaultValue = "ASC") String sortDir) {

        Pageable pageable = PageRequest.of(
                pageNo - 1,
                pageSize,
                Sort.Direction.fromString(sortDir),
                sortBy
        );

        if (role != null) {
            return ResponseEntity.ok(userService.findUserByRole(role, pageable));
        }

        return ResponseEntity.ok(userService.findAllUsers(pageable));
    }

    @PreAuthorize("hasAnyRole('user', 'venue_owner', 'admin')")
    @PutMapping("/{id}")
    public ResponseEntity<UserResponse> updateUser(@PathVariable UUID id, @Valid @RequestBody UpdateUserRequest request) {
        return ResponseEntity.ok(userService.updateUser(id, request));
    }

    @PreAuthorize("hasRole('admin')")
    @PatchMapping("/{id}/role")
    public ResponseEntity<UserResponse> updateUserRole(@PathVariable UUID id,
                                                       @RequestParam Role role) {
        return ResponseEntity.ok(userService.updateUserRole(id, role));
    }

    @PreAuthorize("hasRole('admin')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable UUID id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}
