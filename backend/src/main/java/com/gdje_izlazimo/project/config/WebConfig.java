package com.gdje_izlazimo.project.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    private final RateLimitInterceptor rateLimitInterceptor;
    private final CacheHeaderInterceptor cacheHeaderInterceptor;

    public WebConfig(RateLimitInterceptor rateLimitInterceptor,
                     CacheHeaderInterceptor cacheHeaderInterceptor) {
        this.rateLimitInterceptor = rateLimitInterceptor;
        this.cacheHeaderInterceptor = cacheHeaderInterceptor;
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(rateLimitInterceptor);
        registry.addInterceptor(cacheHeaderInterceptor)
                .addPathPatterns("/events/**", "/venues/**", "/reservations/**",
                        "/profile/**", "/admin/**", "/venue-panel/**");
    }
}