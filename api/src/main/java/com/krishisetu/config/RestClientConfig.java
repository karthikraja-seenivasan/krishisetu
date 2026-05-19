package com.krishisetu.config;

import com.krishisetu.exception.UpstreamException;
import edu.umd.cs.findbugs.annotations.SuppressFBWarnings;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatusCode;
import org.springframework.web.client.RestClient;

/**
 * Configuration class defining isolated RestClient beans for each external service integration,
 * each with centralized upstream error handling.
 */
@Configuration
@SuppressFBWarnings({"EI_EXPOSE_REP", "EI_EXPOSE_REP2"})
public class RestClientConfig {

  private final ExternalApiProperties externalApiProperties;

  /**
   * Constructs RestClientConfig using external API configuration properties.
   *
   * @param externalApiProperties configuration properties for base URLs
   */
  public RestClientConfig(final ExternalApiProperties externalApiProperties) {
    this.externalApiProperties = externalApiProperties;
  }

  /**
   * Configures a RestClient bean for Open-Meteo services.
   *
   * @return RestClient configured for Open-Meteo
   */
  @Bean
  public RestClient openMeteoRestClient() {
    return RestClient.builder()
        .baseUrl(externalApiProperties.openMeteo().baseUrl())
        .defaultStatusHandler(
            HttpStatusCode::isError,
            (request, response) -> {
              throw new UpstreamException(
                  "OpenMeteo service returned error: " + response.getStatusCode());
            })
        .build();
  }

  /**
   * Configures a RestClient bean for NASA POWER services.
   *
   * @return RestClient configured for NASA POWER
   */
  @Bean
  public RestClient nasaPowerRestClient() {
    return RestClient.builder()
        .baseUrl(externalApiProperties.nasaPower().baseUrl())
        .defaultStatusHandler(
            HttpStatusCode::isError,
            (request, response) -> {
              throw new UpstreamException(
                  "NasaPower service returned error: " + response.getStatusCode());
            })
        .build();
  }

  /**
   * Configures a RestClient bean for Agmarknet services.
   *
   * @return RestClient configured for Agmarknet
   */
  @Bean
  public RestClient agmarknetRestClient() {
    return RestClient.builder()
        .baseUrl(externalApiProperties.agmarknet().baseUrl())
        .defaultStatusHandler(
            HttpStatusCode::isError,
            (request, response) -> {
              throw new UpstreamException(
                  "Agmarknet service returned error: " + response.getStatusCode());
            })
        .build();
  }

  /**
   * Configures a RestClient bean for SoilGrids services.
   *
   * @return RestClient configured for SoilGrids
   */
  @Bean
  public RestClient soilgridsRestClient() {
    return RestClient.builder()
        .baseUrl(externalApiProperties.soilgrids().baseUrl())
        .defaultStatusHandler(
            HttpStatusCode::isError,
            (request, response) -> {
              throw new UpstreamException(
                  "Soilgrids service returned error: " + response.getStatusCode());
            })
        .build();
  }
}
