package com.gdje_izlazimo.project.config;

import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.concurrent.ConcurrentMapCache;
import org.springframework.cache.support.SimpleCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.EnableAspectJAutoProxy;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;
import org.springframework.web.client.RestTemplate;

import java.util.Arrays;
import java.util.concurrent.Executor;

@Configuration
@EnableAsync
@EnableCaching
@EnableScheduling
@EnableAspectJAutoProxy
public class PerformanceConfig {

    @Bean(name = "activityLogExecutor")
    public Executor activityLogExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(5);
        executor.setMaxPoolSize(10);
        executor.setQueueCapacity(500);
        executor.setThreadNamePrefix("activity-log-");
        executor.setWaitForTasksToCompleteOnShutdown(true);
        executor.setAwaitTerminationSeconds(60);
        executor.initialize();
        return executor;
    }

    @Bean
    public CacheManager cacheManager() {
        SimpleCacheManager cacheManager = new SimpleCacheManager();
        cacheManager.setCaches(Arrays.asList(
                new ConcurrentMapCache("dashboardStats"),
                new ConcurrentMapCache("venueTypeBreakdown"),
                new ConcurrentMapCache("reservationStatusBreakdown"),
                new ConcurrentMapCache("topVenues"),
                new ConcurrentMapCache("recentActivities")
        ));
        return cacheManager;
    }

    @Bean
    public RestTemplate restTemplate(){
        return new RestTemplate();
    }
}
