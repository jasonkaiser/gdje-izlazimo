package com.gdje_izlazimo.project.dto.request.update;

import com.gdje_izlazimo.project.enums.Role;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record UpdateUserRequest(
        @NotBlank(message = "Name is required")
        String name,
        @NotBlank(message = "Phone is required")
        String phone,
        @NotNull(message = "Role is required")
        Role role
) {
}
