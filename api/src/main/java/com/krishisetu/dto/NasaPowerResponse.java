package com.krishisetu.dto;

import edu.umd.cs.findbugs.annotations.SuppressFBWarnings;
import java.util.Map;

/** Maps the JSON response returned by the NASA POWER climatology database endpoint. */
@SuppressFBWarnings({"EI_EXPOSE_REP", "EI_EXPOSE_REP2"})
public record NasaPowerResponse(Properties properties) {

  /**
   * Represents the nested properties block of the NASA POWER response.
   *
   * @param parameter map containing parameter keys (e.g. "T2M", "PRECTOTCORR") mapping to month
   *     abbreviations (e.g. "JAN", "FEB") and their historical values
   */
  public record Properties(Map<String, Map<String, Double>> parameter) {}
}
