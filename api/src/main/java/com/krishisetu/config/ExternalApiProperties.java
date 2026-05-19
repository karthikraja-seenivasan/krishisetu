package com.krishisetu.config;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

/**
 * Configuration properties for external API services used by the KrishiSetu application. Mapped to
 * the 'krishisetu.external' prefix.
 */
@ConfigurationProperties(prefix = "krishisetu.external")
@Validated
public record ExternalApiProperties(
    @NotNull @Valid OpenMeteo openMeteo,
    @NotNull @Valid NasaPower nasaPower,
    @NotNull @Valid Agmarknet agmarknet,
    @NotNull @Valid Soilgrids soilgrids) {

  /** Configuration for the Open-Meteo weather forecast service. */
  public record OpenMeteo(@NotBlank String baseUrl) {}

  /** Configuration for the NASA POWER climatology database. */
  public record NasaPower(@NotBlank String baseUrl) {}

  /** Configuration for the Agmarknet agricultural price information portal. */
  public record Agmarknet(@NotBlank String baseUrl, String apiKey) {}

  /** Configuration for the SoilGrids physical and chemical soil properties database. */
  public record Soilgrids(@NotBlank String baseUrl) {}
}
