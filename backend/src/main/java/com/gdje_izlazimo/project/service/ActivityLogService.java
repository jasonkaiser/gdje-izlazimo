package com.gdje_izlazimo.project.service;

import com.gdje_izlazimo.project.entity.ActivityLog;
import com.gdje_izlazimo.project.entity.ActivityLog.*;
import com.gdje_izlazimo.project.enums.ActionType;
import com.gdje_izlazimo.project.enums.ActivityStatus;
import com.gdje_izlazimo.project.enums.EntityType;
import com.gdje_izlazimo.project.repository.ActivityLogRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ActivityLogService {

    private final ActivityLogRepository activityLogRepository;


    @Async("activityLogExecutor")
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void logActivity(
            EntityType entityType,
            String entityId,
            String entityName,
            ActionType actionType,
            String message,
            ActivityStatus status,
            String performedBy
    ) {
        try {
            ActivityLog log = ActivityLog.builder()
                    .entityType(entityType)
                    .entityId(entityId)
                    .entityName(entityName)
                    .actionType(actionType)
                    .message(message)
                    .status(status)
                    .performedBy(performedBy)
                    .build();

            activityLogRepository.save(log);
        } catch (Exception e) {
            log.error("Failed to log activity: entityType={}, entityId={}, action={}",
                    entityType, entityId, actionType, e);
        }
    }


    @Transactional(readOnly = true)
    public Page<ActivityLog> getRecentActivities(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return activityLogRepository.findAllByOrderByCreatedAtDesc(pageable);
    }

    @Transactional(readOnly = true)
    public List<ActivityLog> getTopRecentActivities(int limit) {
        return activityLogRepository.findTopNRecentActivities(limit);
    }


    @Transactional(readOnly = true)
    public Page<ActivityLog> getActivitiesByType(EntityType entityType, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return activityLogRepository.findByEntityTypeOrderByCreatedAtDesc(entityType, pageable);
    }


    @Transactional(readOnly = true)
    public long getActivityCountByType(EntityType entityType) {
        return activityLogRepository.countByEntityType(entityType);
    }


    @Transactional
    public void cleanupOldLogs(int daysToKeep) {
        LocalDateTime cutoffDate = LocalDateTime.now().minusDays(daysToKeep);
        activityLogRepository.deleteByCreatedAtBefore(cutoffDate);
        log.info("Cleaned up activity logs older than {} days", daysToKeep);
    }
}