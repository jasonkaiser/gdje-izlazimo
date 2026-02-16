package com.gdje_izlazimo.project.repository;

import com.gdje_izlazimo.project.entity.ActivityLog;
import com.gdje_izlazimo.project.enums.EntityType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface ActivityLogRepository extends JpaRepository<ActivityLog, UUID> {


    Page<ActivityLog> findAllByOrderByCreatedAtDesc(Pageable pageable);


    Page<ActivityLog> findByEntityTypeOrderByCreatedAtDesc(EntityType entityType, Pageable pageable);


    List<ActivityLog> findByCreatedAtBetweenOrderByCreatedAtDesc(
            LocalDateTime startDate,
            LocalDateTime endDate
    );


    long countByEntityType(EntityType entityType);


    @Query(value = "SELECT * FROM activity_logs ORDER BY created_at DESC LIMIT :limit",
            nativeQuery = true)
    List<ActivityLog> findTopNRecentActivities(@Param("limit") int limit);


    void deleteByCreatedAtBefore(LocalDateTime cutoffDate);
}