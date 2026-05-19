package com.krishisetu.config;

import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.util.UUID;
import org.slf4j.MDC;
import org.springframework.stereotype.Component;

/**
 * Filter that propagates a unique request_id via SLF4J MDC context for structured Logstash logging.
 */
@Component
public class MdcFilter implements Filter {

  private static final String REQUEST_ID_KEY = "request_id";
  private static final String REQUEST_HEADER_NAME = "X-Request-ID";

  @Override
  public void doFilter(
      final ServletRequest request, final ServletResponse response, final FilterChain chain)
      throws IOException, ServletException {
    if (request instanceof final HttpServletRequest httpRequest) {
      var requestId = httpRequest.getHeader(REQUEST_HEADER_NAME);
      if (requestId == null || requestId.isBlank()) {
        requestId = UUID.randomUUID().toString();
      }
      MDC.put(REQUEST_ID_KEY, requestId);
    }
    try {
      chain.doFilter(request, response);
    } finally {
      MDC.remove(REQUEST_ID_KEY);
    }
  }
}
