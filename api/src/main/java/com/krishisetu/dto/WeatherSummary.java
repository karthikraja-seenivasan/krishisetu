package com.krishisetu.dto;

import edu.umd.cs.findbugs.annotations.SuppressFBWarnings;
import java.util.List;

/**
 * Unified weather summary containing current live forecast data alongside 30-year historical
 * climatology metrics.
 *
 * @param latitude location latitude
 * @param longitude location longitude
 * @param currentTemperature current live temperature in Celsius
 * @param minTemperature minimum temperature forecast for today in Celsius
 * @param maxTemperature maximum temperature forecast for today in Celsius
 * @param precipitationProbability precipitation probability for today as a percentage (0-100)
 * @param weatherCode WMO weather interpretation code
 * @param condition WMO weather description string
 * @param historicalAverageTemperature 30-year historical average temperature for this month in
 *     Celsius
 * @param historicalAveragePrecipitation 30-year historical average precipitation for this month in
 *     mm
 * @param dailyForecasts list of upcoming 7-day daily forecasts
 */
@SuppressFBWarnings({"EI_EXPOSE_REP", "EI_EXPOSE_REP2"})
public record WeatherSummary(
    double latitude,
    double longitude,
    double currentTemperature,
    double minTemperature,
    double maxTemperature,
    double precipitationProbability,
    int weatherCode,
    String condition,
    double historicalAverageTemperature,
    double historicalAveragePrecipitation,
    List<DailyForecast> dailyForecasts) {

  /** Represents daily forecast prediction entries. */
  public record DailyForecast(
      String date,
      double minTemp,
      double maxTemp,
      int weatherCode,
      double precipitationProbability) {}
}
