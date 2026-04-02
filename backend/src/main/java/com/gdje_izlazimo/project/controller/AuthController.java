package com.gdje_izlazimo.project.controller;

import com.gdje_izlazimo.project.dto.response.UserResponse;
import com.gdje_izlazimo.project.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/auth")
@Tag(name = "Auth", description = "Authentication endpoints")
@SecurityRequirement(name = "bearerAuth")
public class AuthController {

    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    @Operation(summary = "Get current user", description = "Returns the profile of the currently authenticated user. Creates the user locally if it does not exist yet. Requires any authenticated role.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Current user returned successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized — missing or invalid token")
    })
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser(@AuthenticationPrincipal Jwt jwt) {
        UUID userId = UUID.fromString(jwt.getSubject());
        String email = jwt.getClaimAsString("email");
        String username = jwt.getClaimAsString("preferred_username");
        String phoneNumber = jwt.getClaimAsString("phone");

        UserResponse userResponse = userService.getOrCreateResponse(userId, email, username, phoneNumber);

        return ResponseEntity.ok(userResponse);
    }
}