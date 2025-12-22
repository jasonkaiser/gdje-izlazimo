package com.gdje_izlazimo.project.repository;

import com.gdje_izlazimo.project.entity.VenueImage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface VenueImageRepository extends JpaRepository<VenueImage, UUID> {

}