package com.krishisetu.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import edu.umd.cs.findbugs.annotations.SuppressFBWarnings;
import java.util.List;

/** Maps the JSON response returned by the Open-Meteo weather forecast REST service. */
@SuppressFBWarnings({"EI_EXPOSE_REP", "EI_EXPOSE_REP2"})
public record OpenMeteoResponse(double latitude, double longitude, Current current, Daily daily) {

  /** Represents the current weather data block. */
  public record Current(
      @JsonProperty("temperature_2m") double temperature2m,
      @JsonProperty("weather_code") int weatherCode) {}

  /** Represents the daily 7-day weather forecast block. */
  public record Daily(
      List<String> time,
      @JsonProperty("temperature_2m_min") List<Double> temperature2mMin,
      @JsonProperty("temperature_2m_max") List<Double> temperature2mMax,
      @JsonProperty("weather_code") List<Integer> weatherCode,
      @JsonProperty("precipitation_probability_max") List<Double> precipitationProbabilityMax) {}
}
