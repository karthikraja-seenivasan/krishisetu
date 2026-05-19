package com.krishisetu.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/** REST controller for application health and readiness checks. */
@RestController
public class HealthController {

  /** Health status response DTO. */
  public record HealthStatus(String status) {}

  /**
   * Simple endpoint returning application health status.
   *
   * @return standard health response status DTO
   */
  @GetMapping("/health")
  public HealthStatus getHealth() {
    return new HealthStatus("ok");
  }
}
