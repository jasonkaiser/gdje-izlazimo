package com.gdje_izlazimo.project.config;

import com.gdje_izlazimo.project.service.UserService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.UUID;

@Component
public class UserSyncFilter extends OncePerRequestFilter {

    private final UserService userService;

    public UserSyncFilter(UserService userService) {
        this.userService = userService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication != null && authentication.getPrincipal() instanceof Jwt jwt) {
            UUID id = UUID.fromString(jwt.getSubject());
            String email = jwt.getClaimAsString("email");
            String username = jwt.getClaimAsString("preferred_username");
            String phone = jwt.getClaimAsString("phone");

            userService.getOrCreate(id, email, username, phone);
        }

        filterChain.doFilter(request, response);
    }
}