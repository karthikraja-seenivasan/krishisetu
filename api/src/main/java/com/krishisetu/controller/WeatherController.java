package com.krishisetu.controller;

import com.krishisetu.dto.WeatherSummary;
import com.krishisetu.service.WeatherService;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** REST controller that exposes weather aggregation endpoints for the frontend dashboard. */
@RestController
@RequestMapping("/api/v1/weather")
@Validated
public class WeatherController {

  private final WeatherService weatherService;

  /**
   * Constructs the WeatherController.
   *
   * @param weatherService the weather orchestration service
   */
  public WeatherController(final WeatherService weatherService) {
    this.weatherService = weatherService;
  }

  /**
   * Fetches the unified weather summary (live 7-day forecast merged with 30-year climatology).
   *
   * @param lat latitude coordinate (validated between -90 and 90)
   * @param lon longitude coordinate (validated between -180 and 180)
   * @return standard WeatherSummary payload
   */
  @GetMapping
  public WeatherSummary getWeather(
      @RequestParam @Min(-90) @Max(90) final double lat,
      @RequestParam @Min(-180) @Max(180) final double lon) {
    return weatherService.getWeatherSummary(lat, lon);
  }
}
