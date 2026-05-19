package com.krishisetu.service;

import com.krishisetu.dto.MandiPriceEntry;
import com.krishisetu.integration.AgmarknetClient;
import java.util.List;
import org.springframework.stereotype.Service;

/** Service managing mandi crop price indices fetching and calculation workflows. */
@Service
public class PriceService {

  private final AgmarknetClient agmarknetClient;

  /**
   * Constructs the PriceService.
   *
   * @param agmarknetClient Agmarknet integration client
   */
  public PriceService(final AgmarknetClient agmarknetClient) {
    this.agmarknetClient = agmarknetClient;
  }

  /**
   * Fetches market price indices for agricultural crops across districts.
   *
   * @param commodity crop identifier (e.g. Tomato)
   * @param district administrative district (e.g. Kolar)
   * @param days historical interval constraint
   * @return list of matching MandiPriceEntry records
   */
  public List<MandiPriceEntry> getPrices(
      final String commodity, final String district, final int days) {
    // Simply fetch current prices via our caching client.
    // In future iterations, 'days' can support historical timeline lookups if needed.
    return agmarknetClient.fetchPrices(commodity, district);
  }
}
