package com.krishisetu.integration;

import com.krishisetu.dto.SoilProfile;
import edu.umd.cs.findbugs.annotations.SuppressFBWarnings;
import io.github.resilience4j.retry.annotation.Retry;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

/**
 * Integration client that interacts with the ISRIC SoilGrids database REST API to fetch soil
 * properties.
 */
@Component
@SuppressFBWarnings({"EI_EXPOSE_REP", "EI_EXPOSE_REP2"})
public class SoilGridsClient {

  private static final Logger LOG = LoggerFactory.getLogger(SoilGridsClient.class);
  private final RestClient soilgridsRestClient;

  /**
   * Constructs the SoilGridsClient.
   *
   * @param soilgridsRestClient the specialized RestClient bean for SoilGrids
   */
  public SoilGridsClient(final RestClient soilgridsRestClient) {
    this.soilgridsRestClient = soilgridsRestClient;
  }

  /**
   * Fetches soil physical and chemical properties for a location. Caches for 7 days.
   *
   * @param lat latitude coordinate
   * @param lon longitude coordinate
   * @return parsed SoilProfile representing the plot metrics
   */
  @Cacheable(value = "soil-profile", key = "{#lat, #lon}")
  @Retry(name = "weatherApi")
  public SoilProfile fetchSoilProfile(final double lat, final double lon) {
    LOG.info("Requesting soil profile from SoilGrids for lat={}, lon={}", lat, lon);

    try {
      final SoilgridsResponse response =
          soilgridsRestClient
              .get()
              .uri(
                  uriBuilder ->
                      uriBuilder
                          .path("/soilgrids/v2.0/properties/query")
                          .queryParam("lon", lon)
                          .queryParam("lat", lat)
                          .queryParam("property", "phh2o")
                          .queryParam("property", "soc")
                          .queryParam("property", "sand")
                          .queryParam("property", "silt")
                          .queryParam("property", "clay")
                          .queryParam("depth", "0-5cm")
                          .queryParam("value", "mean")
                          .build())
              .retrieve()
              .body(SoilgridsResponse.class);

      if (response == null
          || response.properties() == null
          || response.properties().layers() == null) {
        LOG.warn("Received empty response from SoilGrids, using agricultural fallback.");
        return createFallbackProfile();
      }

      return mapToSoilProfile(response.properties().layers());
    } catch (Exception ex) {
      LOG.error("Failed to query SoilGrids REST API, returning resilient regional fallback.", ex);
      return createFallbackProfile();
    }
  }

  private SoilProfile mapToSoilProfile(final List<Layer> layers) {
    double ph = 6.7;
    double soc = 55.0; // dg/kg -> 0.55%
    double sand = 600.0; // g/kg -> 60.0%
    double silt = 250.0; // g/kg -> 25.0%
    double clay = 150.0; // g/kg -> 15.0%

    for (final Layer layer : layers) {
      if (layer.name() == null || layer.depths() == null || layer.depths().isEmpty()) {
        continue;
      }
      final Depth depth = layer.depths().get(0);
      if (depth.values() == null || depth.values().mean() == null) {
        continue;
      }
      final double val = depth.values().mean();

      switch (layer.name()) {
        case "phh2o" -> ph = val / 10.0;
        case "soc" -> soc = val;
        case "sand" -> sand = val;
        case "silt" -> silt = val;
        case "clay" -> clay = val;
        default -> LOG.debug("Ignored unmapped soil layer name: {}", layer.name());
      }
    }

    final double phFinal = ph;
    final double organicCarbonPercent = soc / 100.0;
    final double sandPercent = sand / 10.0;
    final double siltPercent = silt / 10.0;
    final double clayPercent = clay / 10.0;
    final String texture = determineTexture(sandPercent, siltPercent, clayPercent);

    return new SoilProfile(
        phFinal, organicCarbonPercent, sandPercent, siltPercent, clayPercent, texture);
  }

  private String determineTexture(final double sand, final double silt, final double clay) {
    if (sand > 50.0 && clay < 20.0) {
      return "Sandy Loam";
    } else if (clay > 40.0) {
      return "Clayey";
    } else if (silt > 50.0) {
      return "Silty";
    } else {
      return "Loam";
    }
  }

  private SoilProfile createFallbackProfile() {
    return new SoilProfile(6.7, 0.55, 60.0, 25.0, 15.0, "Sandy Loam");
  }

  /** Jackson compatible JSON structure mapping for SoilGrids. */
  public record SoilgridsResponse(Properties properties) {}

  public record Properties(List<Layer> layers) {}

  public record Layer(String name, List<Depth> depths) {}

  public record Depth(String label, Values values) {}

  public record Values(Double mean) {}
}
