package com.gdje_izlazimo.project.repository;

import com.gdje_izlazimo.project.entity.Event;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface EventRepository extends JpaRepository<Event, UUID> {

}