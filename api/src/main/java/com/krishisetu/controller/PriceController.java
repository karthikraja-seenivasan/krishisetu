package com.krishisetu.controller;

import com.krishisetu.dto.MandiPriceEntry;
import com.krishisetu.service.PriceService;
import edu.umd.cs.findbugs.annotations.SuppressFBWarnings;
import java.util.List;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** REST controller managing endpoints for mandi agricultural price information indices. */
@RestController
@RequestMapping("/api/v1/prices")
@Validated
@SuppressFBWarnings({"EI_EXPOSE_REP", "EI_EXPOSE_REP2"})
public class PriceController {

  private final PriceService priceService;

  /**
   * Constructs the PriceController.
   *
   * @param priceService Mandi price service
   */
  public PriceController(final PriceService priceService) {
    this.priceService = priceService;
  }

  /**
   * Fetches latest crop price indices across district mandis.
   *
   * @param commodity specific agricultural crop (e.g. Tomato)
   * @param district regional administrative center
   * @param days historical interval limit
   * @return list of MandiPriceEntry records matching query
   */
  @GetMapping
  public List<MandiPriceEntry> getPrices(
      @RequestParam(defaultValue = "Tomato") final String commodity,
      @RequestParam(defaultValue = "Kolar") final String district,
      @RequestParam(defaultValue = "14") final int days) {
    return priceService.getPrices(commodity, district, days);
  }
}
