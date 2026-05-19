package com.krishisetu.integration;

import com.krishisetu.dto.OpenMeteoResponse;
import edu.umd.cs.findbugs.annotations.SuppressFBWarnings;
import io.github.resilience4j.retry.annotation.Retry;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

/**
 * Integration client that interacts with the Open-Meteo external weather forecasting REST endpoint.
 */
@Component
@SuppressFBWarnings({"EI_EXPOSE_REP", "EI_EXPOSE_REP2"})
public class OpenMeteoClient {

  private static final Logger LOG = LoggerFactory.getLogger(OpenMeteoClient.class);
  private final RestClient openMeteoRestClient;

  /**
   * Constructs the OpenMeteoClient.
   *
   * @param openMeteoRestClient the specialized RestClient bean for Open-Meteo
   */
  public OpenMeteoClient(final RestClient openMeteoRestClient) {
    this.openMeteoRestClient = openMeteoRestClient;
  }

  /**
   * Fetches live 7-day weather forecasts for given coordinates. Cached to reduce network traffic
   * and rate limit consumption.
   *
   * @param lat latitude coordinate
   * @param lon longitude coordinate
   * @return standard OpenMeteoResponse payload
   */
  @Cacheable(value = "weather-forecast", key = "{#lat, #lon}")
  @Retry(name = "weatherApi")
  public OpenMeteoResponse fetchForecast(final double lat, final double lon) {
    LOG.info("Requesting live weather forecast from Open-Meteo for lat={}, lon={}", lat, lon);

    return openMeteoRestClient
        .get()
        .uri(
            uriBuilder ->
                uriBuilder
                    .path("/v1/forecast")
                    .queryParam("latitude", lat)
                    .queryParam("longitude", lon)
                    .queryParam("current", "temperature_2m,weather_code")
                    .queryParam(
                        "daily",
                        "temperature_2m_min,temperature_2m_max,weather_code,precipitation_probability_max")
                    .queryParam("timezone", "auto")
                    .build())
        .retrieve()
        .body(OpenMeteoResponse.class);
  }
}
