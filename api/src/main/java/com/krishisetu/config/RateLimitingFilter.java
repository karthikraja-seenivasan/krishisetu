package com.krishisetu.config;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

/**
 * Custom servlet filter implementing API rate limiting using Bucket4j. Limits each unique IP
 * address to 60 requests per minute.
 */
@Component
@Order(-105) // Ensure this runs early, just before or around security filters
public class RateLimitingFilter implements Filter {

  private final Map<String, Bucket> cache = new ConcurrentHashMap<>();

  private Bucket createNewBucket() {
    // 60 requests per minute
    final var limit = Bandwidth.classic(60, Refill.intervally(60, Duration.ofMinutes(1)));
    return Bucket.builder().addLimit(limit).build();
  }

  @Override
  public void doFilter(
      final ServletRequest request, final ServletResponse response, final FilterChain chain)
      throws IOException, ServletException {
    if (request instanceof final HttpServletRequest httpRequest
        && response instanceof final HttpServletResponse httpResponse) {

      final var path = httpRequest.getRequestURI();

      // Apply rate limiting only to API routes
      if (path.startsWith("/api/v1/")) {
        final var ip = httpRequest.getRemoteAddr();
        final var bucket = cache.computeIfAbsent(ip, k -> createNewBucket());

        if (!bucket.tryConsume(1)) {
          httpResponse.setStatus(429); // Too Many Requests
          httpResponse.setContentType("application/json");
          httpResponse.setCharacterEncoding("UTF-8");

          final var jsonPayload =
              String.format(
                  "{\"status\":429,\"error\":\"Too Many Requests\",\"message\":\"Rate limit"
                      + " exceeded. Please try again later.\",\"timestamp\":\"%s\"}",
                  Instant.now().toString());
          httpResponse.getWriter().write(jsonPayload);
          return;
        }
      }
    }
    chain.doFilter(request, response);
  }
}
