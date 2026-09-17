package com.legalease.service;

import com.legalease.exception.RateLimitException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Service
public class RateLimitService {

    private static final Logger log = LoggerFactory.getLogger(RateLimitService.class);

    private final StringRedisTemplate redisTemplate;
    // In-memory fallback if Redis is not reachable
    private final Map<String, SlidingWindowInMemory> memoryCache = new ConcurrentHashMap<>();

    public RateLimitService(StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    public void checkRateLimit(String keyPrefix, String identifier, int maxRequests, long windowSeconds) {
        String key = "rate:" + keyPrefix + ":" + identifier;
        long now = Instant.now().toEpochMilli();
        long windowStart = now - (windowSeconds * 1000);

        try {
            if (redisTemplate != null) {
                // Redis sliding window using sorted set
                redisTemplate.opsForZSet().removeRangeByScore(key, 0, windowStart);
                Long currentCount = redisTemplate.opsForZSet().zCard(key);
                if (currentCount != null && currentCount >= maxRequests) {
                    throw new RateLimitException("Rate limit exceeded for " + keyPrefix + ". Please try again later.");
                }
                redisTemplate.opsForZSet().add(key, String.valueOf(now) + "-" + Math.random(), now);
                redisTemplate.expire(key, java.time.Duration.ofSeconds(windowSeconds + 10));
                return;
            }
        } catch (RateLimitException rle) {
            throw rle;
        } catch (Exception e) {
            log.debug("Redis rate limit check failed, falling back to in-memory: {}", e.getMessage());
        }

        // Fallback in-memory check
        SlidingWindowInMemory window = memoryCache.computeIfAbsent(key, k -> new SlidingWindowInMemory(windowSeconds, maxRequests));
        if (!window.allowRequest()) {
            throw new RateLimitException("Rate limit exceeded for " + keyPrefix + ". Please try again later.");
        }
    }

    private static class SlidingWindowInMemory {
        private final long windowMillis;
        private final int maxRequests;
        private long windowStart;
        private final AtomicInteger counter = new AtomicInteger(0);

        public SlidingWindowInMemory(long windowSeconds, int maxRequests) {
            this.windowMillis = windowSeconds * 1000;
            this.maxRequests = maxRequests;
            this.windowStart = System.currentTimeMillis();
        }

        public synchronized boolean allowRequest() {
            long now = System.currentTimeMillis();
            if (now - windowStart > windowMillis) {
                windowStart = now;
                counter.set(0);
            }
            return counter.incrementAndGet() <= maxRequests;
        }
    }
}
