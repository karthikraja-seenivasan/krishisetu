package com.krishisetu.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.when;

import com.krishisetu.dto.NasaPowerResponse;
import com.krishisetu.dto.OpenMeteoResponse;
import com.krishisetu.integration.NasaPowerClient;
import com.krishisetu.integration.OpenMeteoClient;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

/**
 * Unit tests verifying WeatherService's capability of merging forecasts with climatology normals
 * correctly.
 */
@ExtendWith(MockitoExtension.class)
class WeatherServiceTest {

  @Mock private OpenMeteoClient openMeteoClient;

  @Mock private NasaPowerClient nasaPowerClient;

  @InjectMocks private WeatherService weatherService;

  @Test
  void testGetWeatherSummary() {
    final double lat = 13.0;
    final double lon = 78.0;

    final var mockForecast =
        new OpenMeteoResponse(
            lat,
            lon,
            new OpenMeteoResponse.Current(25.5, 0),
            new OpenMeteoResponse.Daily(
                List.of("2026-05-19"), List.of(20.0), List.of(30.0), List.of(0), List.of(10.0)));

    final var mockClimatology =
        new NasaPowerResponse(
            new NasaPowerResponse.Properties(
                Map.of(
                    "T2M", Map.of("MAY", 28.0),
                    "PRECTOTCORR", Map.of("MAY", 5.5))));

    when(openMeteoClient.fetchForecast(lat, lon)).thenReturn(mockForecast);
    when(nasaPowerClient.fetchClimatology(lat, lon)).thenReturn(mockClimatology);

    final var result = weatherService.getWeatherSummary(lat, lon);

    assertNotNull(result);
    assertEquals(25.5, result.currentTemperature());
    assertEquals(20.0, result.minTemperature());
    assertEquals(30.0, result.maxTemperature());
    assertEquals(10.0, result.precipitationProbability());
    assertEquals(28.0, result.historicalAverageTemperature());
    assertEquals(5.5, result.historicalAveragePrecipitation());
    assertEquals("Sunny / Clear Sky", result.condition());
    assertEquals(1, result.dailyForecasts().size());
  }
}
