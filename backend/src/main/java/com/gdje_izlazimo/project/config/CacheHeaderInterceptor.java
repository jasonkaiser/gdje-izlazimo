package com.gdje_izlazimo.project.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class CacheHeaderInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request,
                             HttpServletResponse response,
                             Object handler) {

        String path = request.getRequestURI();
        String method = request.getMethod();

        if (!"GET".equalsIgnoreCase(method)) {
            response.setHeader("Cache-Control", "no-store");
            return true;
        }

        if (path.startsWith("/events") || path.startsWith("/venues")) {
            response.setHeader("Cache-Control", "public, max-age=300, stale-while-revalidate=3600");

        } else if (path.startsWith("/reservations")
                || path.startsWith("/profile")
                || path.startsWith("/admin")
                || path.startsWith("/venue-panel")) {
            response.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
            response.setHeader("Pragma", "no-cache");

        } else {
            response.setHeader("Cache-Control", "no-store");
        }

        return true;
    }
}