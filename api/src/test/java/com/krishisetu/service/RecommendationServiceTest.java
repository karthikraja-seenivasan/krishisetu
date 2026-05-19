package com.krishisetu.service;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;

import com.krishisetu.dto.CropEntry;
import com.krishisetu.dto.Season;
import com.krishisetu.dto.SoilProfile;
import com.krishisetu.dto.WeatherSummary;
import com.krishisetu.integration.SoilGridsClient;
import java.util.Collections;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

/** Unit tests verifying RecommendationService suitability ranking and rationale logic. */
@ExtendWith(MockitoExtension.class)
class RecommendationServiceTest {

  @Mock private WeatherService weatherService;

  @Mock private CropMatrixLoader cropMatrixLoader;

  @Mock private SoilGridsClient soilGridsClient;

  @InjectMocks private RecommendationService recommendationService;

  @Test
  void testTomatoRagiGroundnutTop3InKharif() {
    final double lat = 13.13;
    final double lon = 78.13;

    final var mockWeather =
        new WeatherSummary(
            lat, lon, 25.5, 20.0, 30.0, 10.0, 0, "Sunny", 28.0, 150.0, Collections.emptyList());

    final var tomato =
        new CropEntry(
            "tomato",
            "Tomato",
            "ಟೊಮ್ಯಾಟೋ",
            400.0,
            800.0,
            18.0,
            32.0,
            6.0,
            7.5,
            "Sandy Loam",
            52000.0,
            180.0,
            110,
            "MEDIUM",
            new CropEntry.TypicalPriceBand(800.0, 1500.0, 1200.0));

    final var ragi =
        new CropEntry(
            "ragi",
            "Ragi",
            "ರಾಗಿ",
            300.0,
            600.0,
            15.0,
            35.0,
            5.0,
            8.2,
            "Sandy Loam",
            12000.0,
            15.0,
            120,
            "LOW",
            new CropEntry.TypicalPriceBand(3500.0, 4200.0, 3840.0));

    final var groundnut =
        new CropEntry(
            "groundnut",
            "Groundnut",
            "ನೆಲಗಡಲೆ",
            350.0,
            700.0,
            20.0,
            30.0,
            6.0,
            7.5,
            "Sandy Loam",
            18000.0,
            12.0,
            115,
            "LOW",
            new CropEntry.TypicalPriceBand(5500.0, 6800.0, 6300.0));

    final var sugarcane =
        new CropEntry(
            "sugarcane",
            "Sugarcane",
            "ಕಬ್ಬು",
            1100.0,
            1500.0,
            20.0,
            40.0,
            6.0,
            7.5,
            "Clay Loam",
            65000.0,
            350.0,
            365,
            "HIGH",
            new CropEntry.TypicalPriceBand(300.0, 350.0, 325.0));

    final var mockSoil = new SoilProfile(6.7, 0.55, 60.0, 25.0, 15.0, "Sandy Loam");
    when(soilGridsClient.fetchSoilProfile(lat, lon)).thenReturn(mockSoil);
    when(weatherService.getWeatherSummary(lat, lon)).thenReturn(mockWeather);
    when(cropMatrixLoader.getCrops()).thenReturn(List.of(tomato, ragi, groundnut, sugarcane));

    final var result = recommendationService.recommend(lat, lon, Season.KHARIF);

    assertNotNull(result);
    assertEquals(3, result.size());

    // Verify Tomato, Ragi, Groundnut occupy top 3 positions due to specific anchor tuning
    final var cropIds = result.stream().map(r -> r.cropId()).toList();
    assertTrue(cropIds.contains("tomato"));
    assertTrue(cropIds.contains("ragi"));
    assertTrue(cropIds.contains("groundnut"));
    assertFalse(cropIds.contains("sugarcane"));

    // Verify rationale is generated correctly
    result.forEach(
        recommendation -> {
          assertNotNull(recommendation.rationale());
          assertFalse(recommendation.rationale().isBlank());
        });
  }

  @Test
  void testSugarcaneExcludedDuringDrySummer() {
    final double lat = 13.13;
    final double lon = 78.13;

    // Normal climate, but selecting Summer season which adds heavy penalties to high water crops
    final var mockWeather =
        new WeatherSummary(
            lat, lon, 35.0, 28.0, 40.0, 5.0, 0, "Sunny", 34.0, 15.0, Collections.emptyList());

    final var ragi =
        new CropEntry(
            "ragi",
            "Ragi",
            "ರಾಗಿ",
            300.0,
            600.0,
            15.0,
            35.0,
            5.0,
            8.2,
            "Sandy Loam",
            12000.0,
            15.0,
            120,
            "LOW",
            new CropEntry.TypicalPriceBand(3500.0, 4200.0, 3840.0));

    final var groundnut =
        new CropEntry(
            "groundnut",
            "Groundnut",
            "ನೆಲಗಡಲೆ",
            350.0,
            700.0,
            20.0,
            30.0,
            6.0,
            7.5,
            "Sandy Loam",
            18000.0,
            12.0,
            115,
            "LOW",
            new CropEntry.TypicalPriceBand(5500.0, 6800.0, 6300.0));

    final var sugarcane =
        new CropEntry(
            "sugarcane",
            "Sugarcane",
            "ಕಬ್ಬು",
            1100.0,
            1500.0,
            20.0,
            40.0,
            6.0,
            7.5,
            "Clay Loam",
            65000.0,
            350.0,
            365,
            "HIGH",
            new CropEntry.TypicalPriceBand(300.0, 350.0, 325.0));

    final var mockSoil = new SoilProfile(6.7, 0.55, 60.0, 25.0, 15.0, "Sandy Loam");
    when(soilGridsClient.fetchSoilProfile(lat, lon)).thenReturn(mockSoil);
    when(weatherService.getWeatherSummary(lat, lon)).thenReturn(mockWeather);
    when(cropMatrixLoader.getCrops()).thenReturn(List.of(ragi, groundnut, sugarcane));

    final var result = recommendationService.recommend(lat, lon, Season.SUMMER);

    assertNotNull(result);
    // Sugarcane should rank lower than low water crops under summer heat & low precip conditions
    final var topCrop = result.get(0);
    assertFalse("sugarcane".equals(topCrop.cropId()));
  }

  private void assertEquals(final int expected, final int actual) {
    org.junit.jupiter.api.Assertions.assertEquals(expected, actual);
  }
}
