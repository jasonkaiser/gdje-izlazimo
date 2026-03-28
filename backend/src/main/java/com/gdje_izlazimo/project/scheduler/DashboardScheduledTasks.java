package com.gdje_izlazimo.project.scheduler;

import com.gdje_izlazimo.project.service.ActivityLogService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.CacheManager;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DashboardScheduledTasks {

    private final ActivityLogService activityLogService;
    private final CacheManager cacheManager;


    @Scheduled(cron = "0 0 3 * * ?")
    public void cleanupOldActivityLogs() {
        log.info("Starting scheduled cleanup of old activity logs");
        activityLogService.cleanupOldLogs(90);
        log.info("Completed scheduled cleanup of old activity logs");
    }


    @Scheduled(fixedRate = 300_000)
    public void clearDashboardCache() {
        var cache = cacheManager.getCache("dashboardStats");
        if (cache != null) {
            cache.clear();
            log.debug("Cleared dashboardStats cache");
        } else {
            log.warn("dashboardStats cache not found — check cache configuration");
        }
    }
}