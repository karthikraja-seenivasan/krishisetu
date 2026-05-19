package com.krishisetu.config;

import edu.umd.cs.findbugs.annotations.SuppressFBWarnings;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/** Web MVC configuration class for setting up CORS policies and custom web mappings. */
@Configuration
@SuppressFBWarnings({"EI_EXPOSE_REP", "EI_EXPOSE_REP2"})
public class WebConfig implements WebMvcConfigurer {

  private final List<String> allowedOrigins;

  /**
   * Constructs the WebConfig with allowed origins injected from properties.
   *
   * @param allowedOrigins list of allowed CORS origins
   */
  public WebConfig(
      @Value("${krishisetu.cors.allowed-origins:http://localhost:3000}")
          final List<String> allowedOrigins) {
    this.allowedOrigins = allowedOrigins;
  }

  /**
   * Configures a CorsConfigurationSource bean scoped to the frontend origin.
   *
   * @return the configured CorsConfigurationSource
   */
  @Bean
  public CorsConfigurationSource corsConfigurationSource() {
    final var configuration = new CorsConfiguration();
    configuration.setAllowedOrigins(allowedOrigins);
    configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
    configuration.setAllowedHeaders(List.of("Authorization", "Cache-Control", "Content-Type"));
    configuration.setExposedHeaders(List.of("Authorization"));
    configuration.setAllowCredentials(true);
    configuration.setMaxAge(3600L);

    final var source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", configuration);
    return source;
  }
}
