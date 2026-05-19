package com.krishisetu.service;

import com.krishisetu.dto.WeatherSummary;
import com.krishisetu.integration.NasaPowerClient;
import com.krishisetu.integration.OpenMeteoClient;
import java.time.LocalDate;
import java.time.format.TextStyle;
import java.util.ArrayList;
import java.util.Locale;
import org.springframework.stereotype.Service;

/**
 * Orchestrator service that aggregates real-time weather forecasts and long-term 30-year monthly
 * climatological averages.
 */
@Service
public class WeatherService {

  private final OpenMeteoClient openMeteoClient;
  private final NasaPowerClient nasaPowerClient;

  /**
   * Constructs the WeatherService.
   *
   * @param openMeteoClient client for live forecasts
   * @param nasaPowerClient client for historical normals
   */
  public WeatherService(
      final OpenMeteoClient openMeteoClient, final NasaPowerClient nasaPowerClient) {
    this.openMeteoClient = openMeteoClient;
    this.nasaPowerClient = nasaPowerClient;
  }

  /**
   * Builds the aggregated weather summary containing current forecasts, 7-day future details, and
   * monthly normals.
   *
   * @param lat location latitude
   * @param lon location longitude
   * @return standard WeatherSummary DTO
   */
  public WeatherSummary getWeatherSummary(final double lat, final double lon) {
    final var forecast = openMeteoClient.fetchForecast(lat, lon);
    final var climatology = nasaPowerClient.fetchClimatology(lat, lon);

    final var currentMonth =
        LocalDate.now()
            .getMonth()
            .getDisplayName(TextStyle.SHORT, Locale.ENGLISH)
            .toUpperCase(Locale.ENGLISH);

    final var histTemp = getHistTemp(climatology, currentMonth);
    final var histPrecip = getHistPrecip(climatology, currentMonth);

    final var currentTemp = forecast.current().temperature2m();
    final var wmoCode = forecast.current().weatherCode();
    final var condition = translateWmoCode(wmoCode);

    final var minTemps = forecast.daily().temperature2mMin();
    final var maxTemps = forecast.daily().temperature2mMax();
    final var dailyPrecip = forecast.daily().precipitationProbabilityMax();

    final var minToday = minTemps.isEmpty() ? currentTemp : minTemps.get(0);
    final var maxToday = maxTemps.isEmpty() ? currentTemp : maxTemps.get(0);
    final var precipToday = dailyPrecip.isEmpty() ? 0.0 : dailyPrecip.get(0);

    return new WeatherSummary(
        lat,
        lon,
        currentTemp,
        minToday,
        maxToday,
        precipToday,
        wmoCode,
        condition,
        histTemp,
        histPrecip,
        getDailyForecastList(forecast));
  }

  private double getHistTemp(
      final com.krishisetu.dto.NasaPowerResponse climatology, final String month) {
    if (climatology != null
        && climatology.properties() != null
        && climatology.properties().parameter() != null) {
      final var tempMap = climatology.properties().parameter().get("T2M");
      if (tempMap != null) {
        return tempMap.getOrDefault(month, 0.0);
      }
    }
    return 0.0;
  }

  private double getHistPrecip(
      final com.krishisetu.dto.NasaPowerResponse climatology, final String month) {
    if (climatology != null
        && climatology.properties() != null
        && climatology.properties().parameter() != null) {
      final var precipMap = climatology.properties().parameter().get("PRECTOTCORR");
      if (precipMap != null) {
        return precipMap.getOrDefault(month, 0.0);
      }
    }
    return 0.0;
  }

  private java.util.List<WeatherSummary.DailyForecast> getDailyForecastList(
      final com.krishisetu.dto.OpenMeteoResponse forecast) {
    final var dailyTimes = forecast.daily().time();
    final var minTemps = forecast.daily().temperature2mMin();
    final var maxTemps = forecast.daily().temperature2mMax();
    final var dailyCodes = forecast.daily().weatherCode();
    final var dailyPrecip = forecast.daily().precipitationProbabilityMax();

    final var dailyForecasts = new ArrayList<WeatherSummary.DailyForecast>();
    final int limit = Math.min(7, dailyTimes.size());
    for (int i = 0; i < limit; i++) {
      dailyForecasts.add(
          new WeatherSummary.DailyForecast(
              dailyTimes.get(i),
              minTemps.get(i),
              maxTemps.get(i),
              dailyCodes.get(i),
              dailyPrecip.get(i)));
    }
    return dailyForecasts;
  }

  private String translateWmoCode(final int code) {
    return switch (code) {
      case 0 -> "Sunny / Clear Sky";
      case 1, 2, 3 -> "Partly Cloudy";
      case 45, 48 -> "Foggy";
      case 51, 53, 55 -> "Light Drizzle";
      case 61, 63, 65 -> "Rainy";
      case 80, 81, 82 -> "Rain Showers";
      case 95, 96, 99 -> "Thunderstorm";
      default -> "Cloudy";
    };
  }
}
