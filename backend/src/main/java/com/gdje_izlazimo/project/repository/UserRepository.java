package com.gdje_izlazimo.project.repository;

import com.gdje_izlazimo.project.entity.User;
import com.gdje_izlazimo.project.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {

    boolean existsByEmail(String email);
    Optional<User> findByEmail(String email);

    List<User> findByRole(Role role);
}
