package com.krishisetu.controller;

import com.krishisetu.dto.CropRecommendationsResponse;
import com.krishisetu.dto.Season;
import com.krishisetu.service.RecommendationService;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controller class that exposes REST endpoints for calculating and returning personalized crop
 * suitability recommendations.
 */
@RestController
@RequestMapping("/api/v1/crops")
@Validated
public class CropController {

  private static final Logger LOG = LoggerFactory.getLogger(CropController.class);
  private final RecommendationService recommendationService;

  /**
   * Constructs the CropController.
   *
   * @param recommendationService service logic for executing crop matrix score logic
   */
  public CropController(final RecommendationService recommendationService) {
    this.recommendationService = recommendationService;
  }

  /**
   * Generates top crop recommendations based on location coordinates and crop season.
   *
   * @param lat plot latitude coordinate
   * @param lon plot longitude coordinate
   * @param season selected agricultural cropping season
   * @return standard CropRecommendationsResponse payload containing ranking details
   */
  @GetMapping("/recommend")
  public CropRecommendationsResponse recommend(
      @RequestParam @NotNull @DecimalMin("-90.0") @DecimalMax("90.0") final Double lat,
      @RequestParam @NotNull @DecimalMin("-180.0") @DecimalMax("180.0") final Double lon,
      @RequestParam @NotNull final Season season) {
    LOG.info("Received crop recommendation request: lat={}, lon={}, season={}", lat, lon, season);
    final var recommendations = recommendationService.recommend(lat, lon, season);
    return new CropRecommendationsResponse(season, recommendations);
  }
}
