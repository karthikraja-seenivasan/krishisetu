package com.krishisetu;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

/**
 * Main entry point for the KrishiSetu Spring Boot Application. Configured with virtual threads
 * enabled by default.
 */
@SpringBootApplication
@ConfigurationPropertiesScan
public class KrishiSetuApplication {

  public static void main(final String[] args) {
    SpringApplication.run(KrishiSetuApplication.class, args);
  }
}
