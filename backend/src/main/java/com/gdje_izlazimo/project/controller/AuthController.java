package com.gdje_izlazimo.project.controller;

import com.gdje_izlazimo.project.dto.response.UserResponse;
import com.gdje_izlazimo.project.repository.UserRepository;
import com.gdje_izlazimo.project.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final UserService userService;


    public AuthController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser(Authentication authentication){

        Jwt jwt = (Jwt) authentication.getPrincipal();
        String userIdString = jwt.getClaimAsString("sub");

        UUID userId = UUID.fromString(userIdString);
        UserResponse userResponse = userService.findUserById(userId);

        return ResponseEntity.ok(userResponse);


    }

}
