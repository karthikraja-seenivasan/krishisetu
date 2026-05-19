package com.krishisetu.integration;

import com.krishisetu.dto.NasaPowerResponse;
import edu.umd.cs.findbugs.annotations.SuppressFBWarnings;
import io.github.resilience4j.retry.annotation.Retry;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

/** Integration client that interacts with the NASA POWER climatology database endpoint. */
@Component
@SuppressFBWarnings({"EI_EXPOSE_REP", "EI_EXPOSE_REP2"})
public class NasaPowerClient {

  private static final Logger LOG = LoggerFactory.getLogger(NasaPowerClient.class);
  private final RestClient nasaPowerRestClient;

  /**
   * Constructs the NasaPowerClient.
   *
   * @param nasaPowerRestClient the specialized RestClient bean for NASA POWER
   */
  public NasaPowerClient(final RestClient nasaPowerRestClient) {
    this.nasaPowerRestClient = nasaPowerRestClient;
  }

  /**
   * Fetches 30-year monthly historical averages of temperature and precipitation for a location.
   *
   * @param lat latitude coordinate
   * @param lon longitude coordinate
   * @return standard NasaPowerResponse payload
   */
  @Cacheable(value = "weather-climatology", key = "{#lat, #lon}")
  @Retry(name = "weatherApi")
  public NasaPowerResponse fetchClimatology(final double lat, final double lon) {
    LOG.info("Requesting climatological normal from NASA POWER for lat={}, lon={}", lat, lon);

    return nasaPowerRestClient
        .get()
        .uri(
            uriBuilder ->
                uriBuilder
                    .path("/api/temporal/climatology/point")
                    .queryParam("parameters", "T2M,PRECTOTCORR")
                    .queryParam("community", "AG")
                    .queryParam("longitude", lon)
                    .queryParam("latitude", lat)
                    .queryParam("format", "JSON")
                    .build())
        .retrieve()
        .body(NasaPowerResponse.class);
  }
}
