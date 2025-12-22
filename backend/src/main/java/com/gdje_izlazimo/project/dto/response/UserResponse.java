package com.gdje_izlazimo.project.dto.response;

import com.gdje_izlazimo.project.enums.Role;

import java.time.LocalDateTime;
import java.util.UUID;

public record UserResponse(
        UUID id,
        String name,
        String email,
        String phone,
        Role role,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
