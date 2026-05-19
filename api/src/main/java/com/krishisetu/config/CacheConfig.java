package com.krishisetu.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import java.util.List;
import java.util.concurrent.TimeUnit;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.caffeine.CaffeineCache;
import org.springframework.cache.support.SimpleCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration class that sets up distinct Caffeine caches with customized eviction policies and
 * TTL ranges.
 */
@Configuration
@EnableCaching
public class CacheConfig {

  /**
   * Configures a custom SimpleCacheManager with distinct Caffeine cache targets.
   *
   * @return the configured CacheManager
   */
  @Bean
  public CacheManager cacheManager() {
    final var simpleCacheManager = new SimpleCacheManager();

    final var weatherForecastCache =
        new CaffeineCache(
            "weather-forecast",
            Caffeine.newBuilder().expireAfterWrite(30, TimeUnit.MINUTES).maximumSize(500).build());

    final var weatherClimatologyCache =
        new CaffeineCache(
            "weather-climatology",
            Caffeine.newBuilder().expireAfterWrite(24, TimeUnit.HOURS).maximumSize(100).build());

    final var mandiPricesCache =
        new CaffeineCache(
            "mandi-prices",
            Caffeine.newBuilder().expireAfterWrite(6, TimeUnit.HOURS).maximumSize(200).build());

    final var soilProfileCache =
        new CaffeineCache(
            "soil-profile",
            Caffeine.newBuilder().expireAfterWrite(7, TimeUnit.DAYS).maximumSize(500).build());

    final var rateLimitCache =
        new CaffeineCache(
            "rate-limit-cache",
            Caffeine.newBuilder().expireAfterWrite(1, TimeUnit.HOURS).maximumSize(1000).build());

    simpleCacheManager.setCaches(
        List.of(
            weatherForecastCache,
            weatherClimatologyCache,
            mandiPricesCache,
            soilProfileCache,
            rateLimitCache));

    return simpleCacheManager;
  }
}
