package com.gdje_izlazimo.project.repository;

import com.gdje_izlazimo.project.entity.TableType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface TableTypeRepository extends JpaRepository<TableType, UUID> {

}