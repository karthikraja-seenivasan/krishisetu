package com.krishisetu.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/** Configuration class for OpenApi (SpringDoc) schema generation and customized UI descriptors. */
@Configuration
public class OpenApiConfig {

  /**
   * Builds custom OpenAPI definitions for endpoints in the KrishiSetu application.
   *
   * @return standard OpenAPI metadata descriptor
   */
  @Bean
  public OpenAPI customOpenApi() {
    return new OpenAPI()
        .info(
            new Info()
                .title("KrishiSetu API Documentation")
                .version("1.0.0")
                .description("REST API endpoints for the KrishiSetu Agricultural MVP dashboard"));
  }
}
