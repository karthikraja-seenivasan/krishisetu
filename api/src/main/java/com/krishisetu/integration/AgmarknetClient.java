package com.krishisetu.integration;

import com.krishisetu.config.ExternalApiProperties;
import com.krishisetu.dto.MandiPriceEntry;
import edu.umd.cs.findbugs.annotations.SuppressFBWarnings;
import io.github.resilience4j.retry.annotation.Retry;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

/**
 * Integration client that interacts with the Agmarknet agricultural price information portal API.
 */
@Component
@SuppressFBWarnings({"EI_EXPOSE_REP", "EI_EXPOSE_REP2"})
public class AgmarknetClient {

  private static final Logger LOG = LoggerFactory.getLogger(AgmarknetClient.class);
  private final RestClient agmarknetRestClient;
  private final ExternalApiProperties externalApiProperties;

  /**
   * Constructs the AgmarknetClient.
   *
   * @param agmarknetRestClient the specialized RestClient bean for Agmarknet
   * @param externalApiProperties the external configuration properties for keys and base paths
   */
  public AgmarknetClient(
      final RestClient agmarknetRestClient, final ExternalApiProperties externalApiProperties) {
    this.agmarknetRestClient = agmarknetRestClient;
    this.externalApiProperties = externalApiProperties;
  }

  /**
   * Fetches latest mandi pricing indices for a commodity in a specific district. Caches for 6
   * hours.
   *
   * @param commodity crop identifier (e.g. Tomato)
   * @param district administrative regional name (e.g. Kolar)
   * @return list of MandiPriceEntry records matching criteria
   */
  @Cacheable(value = "mandi-prices", key = "{#commodity, #district}")
  @Retry(name = "weatherApi")
  public List<MandiPriceEntry> fetchPrices(final String commodity, final String district) {
    final String apiKey = externalApiProperties.agmarknet().apiKey();

    if (apiKey == null || apiKey.trim().isEmpty()) {
      LOG.info("Agmarknet API key not configured. Using live mock prices.");
      return generateMockPrices(commodity, district);
    }

    try {
      LOG.info(
          "Requesting market pricing from Agmarknet API for commodity={}, district={}",
          commodity,
          district);
      final AgmarknetApiResponse response = queryAgmarknetApi(apiKey, commodity, district);

      if (response == null || response.records() == null || response.records().isEmpty()) {
        LOG.warn("No market records found in Agmarknet API, fallback to mock.");
        return generateMockPrices(commodity, district);
      }

      return parseResponse(response);
    } catch (Exception ex) {
      LOG.error("Failed to query Agmarknet API, fallback to mock.", ex);
      return generateMockPrices(commodity, district);
    }
  }

  private AgmarknetApiResponse queryAgmarknetApi(
      final String apiKey, final String commodity, final String district) {
    return agmarknetRestClient
        .get()
        .uri(
            uriBuilder ->
                uriBuilder
                    .path("/resource/9ef842f8-8544-4634-ad97-b8398e7e56f8")
                    .queryParam("api-key", apiKey)
                    .queryParam("format", "json")
                    .queryParam("filters[commodity]", commodity)
                    .queryParam("filters[district]", district)
                    .build())
        .retrieve()
        .body(AgmarknetApiResponse.class);
  }

  private List<MandiPriceEntry> parseResponse(final AgmarknetApiResponse response) {
    final List<MandiPriceEntry> entries = new ArrayList<>();
    for (final RecordItem item : response.records()) {
      entries.add(
          new MandiPriceEntry(
              item.state(),
              item.district(),
              item.market(),
              item.commodity(),
              item.variety(),
              item.grade(),
              item.arrival_date(),
              new BigDecimal(item.min_price()),
              new BigDecimal(item.max_price()),
              new BigDecimal(item.modal_price())));
    }
    return entries;
  }

  private List<MandiPriceEntry> generateMockPrices(final String commodity, final String district) {
    final List<MandiPriceEntry> list = new ArrayList<>();
    final String cleanComm = commodity == null ? "Tomato" : commodity;
    final String cleanDist = district == null ? "Kolar" : district;

    final LocalDate date = LocalDate.now().minusDays(1);
    final String arrivalDate = date.format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));
    final BasePrices base = getBasePrices(cleanComm);

    final String[] mandis = {"Kolar", "Chintamani", "Yashwantpur (Bengaluru)", "Tumkur"};
    for (final String mandi : mandis) {
      final double offset = getMandiOffset(mandi);
      list.add(
          new MandiPriceEntry(
              "Karnataka",
              cleanDist,
              mandi,
              cleanComm,
              "Local",
              "FAQ",
              arrivalDate,
              base.min().multiply(BigDecimal.valueOf(offset)).setScale(0, BigDecimal.ROUND_HALF_UP),
              base.max().multiply(BigDecimal.valueOf(offset)).setScale(0, BigDecimal.ROUND_HALF_UP),
              base.modal()
                  .multiply(BigDecimal.valueOf(offset))
                  .setScale(0, BigDecimal.ROUND_HALF_UP)));
    }
    return list;
  }

  private double getMandiOffset(final String mandi) {
    return switch (mandi) {
      case "Kolar" -> 1.0;
      case "Chintamani" -> 0.95;
      case "Yashwantpur (Bengaluru)" -> 1.15;
      default -> 1.05;
    };
  }

  private BasePrices getBasePrices(final String commodity) {
    final String lower = commodity.toLowerCase(Locale.ROOT);
    if (lower.contains("tomato")) {
      return new BasePrices(new BigDecimal("1000"), new BigDecimal("1800"), new BigDecimal("1400"));
    } else if (lower.contains("maize")) {
      return new BasePrices(new BigDecimal("1800"), new BigDecimal("2400"), new BigDecimal("2100"));
    } else if (lower.contains("ragi")) {
      return new BasePrices(new BigDecimal("2800"), new BigDecimal("3500"), new BigDecimal("3200"));
    } else if (lower.contains("groundnut")) {
      return new BasePrices(new BigDecimal("5500"), new BigDecimal("6800"), new BigDecimal("6200"));
    }
    return new BasePrices(new BigDecimal("800"), new BigDecimal("1500"), new BigDecimal("1200"));
  }

  private record BasePrices(BigDecimal min, BigDecimal max, BigDecimal modal) {}

  /** Jackson compatible JSON structure mapping for Agmarknet. */
  public record AgmarknetApiResponse(List<RecordItem> records) {}

  public record RecordItem(
      String state,
      String district,
      String market,
      String commodity,
      String variety,
      String grade,
      String arrival_date,
      String min_price,
      String max_price,
      String modal_price) {}
}
