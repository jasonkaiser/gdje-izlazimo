package com.gdje_izlazimo.project.config;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.io.IOException;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class RateLimitInterceptor implements HandlerInterceptor {

    private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();

    private Bucket createBucket(int limit) {
        Refill refill = Refill.intervally(limit, Duration.ofMinutes(1));
        Bandwidth bandwidth = Bandwidth.classic(limit, refill);
        return Bucket.builder().addLimit(bandwidth).build();
    }

    private String getClientIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isBlank()) ip = request.getRemoteAddr();
        return ip;
    }

    @Override
    public boolean preHandle(HttpServletRequest request,
                             HttpServletResponse response,
                             Object handler) throws IOException {

        String uri = request.getRequestURI();
        String method = request.getMethod();

        if ("POST".equals(method) && uri.contains("/venue-images/upload")) {
            return checkLimit(request, response, "upload", 10);
        }
        if ("POST".equals(method) && uri.startsWith("/reservations")) {
            return checkLimit(request, response, "reservations", 5);
        }
        if ("GET".equals(method) && uri.contains("/venues/search")) {
            return checkLimit(request, response, "search", 30);
        }

        return true;
    }

    private boolean checkLimit(HttpServletRequest request,
                               HttpServletResponse response,
                               String route, int limit) throws IOException {

        String key = getClientIp(request) + ":" + route;
        Bucket bucket = buckets.computeIfAbsent(key, k -> createBucket(limit));

        if (bucket.tryConsume(1)) {
            return true;
        }

        response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
        response.setContentType("application/json");
        response.getWriter().write("{\"error\": \"Too many requests. Please try again later.\"}");
        return false;
    }
}