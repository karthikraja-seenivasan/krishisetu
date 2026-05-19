package com.krishisetu.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter;

/** Security configuration for Spring Security setup on the REST API endpoints. */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

  private final WebConfig webConfig;

  /**
   * Constructs the SecurityConfig with WebConfig dependency injection.
   *
   * @param webConfig injected WebConfig for CORS sharing settings
   */
  public SecurityConfig(final WebConfig webConfig) {
    this.webConfig = webConfig;
  }

  /**
   * Defines the security filter chain enforcing stateless sessions, strict headers, and open
   * endpoints for the MVP scope.
   *
   * @param http the HttpSecurity builder
   * @return the built SecurityFilterChain
   * @throws Exception if security building fails
   */
  @Bean
  public SecurityFilterChain securityFilterChain(final HttpSecurity http) throws Exception {
    http.csrf(csrf -> csrf.disable())
        .cors(cors -> cors.configurationSource(webConfig.corsConfigurationSource()))
        .sessionManagement(
            session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .authorizeHttpRequests(
            auth ->
                auth.requestMatchers("/health")
                    .permitAll()
                    .requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html")
                    .permitAll()
                    .requestMatchers("/api/v1/**")
                    .permitAll()
                    .anyRequest()
                    .authenticated())
        .headers(
            headers ->
                headers
                    .frameOptions(frame -> frame.deny())
                    .referrerPolicy(
                        referrer ->
                            referrer.policy(
                                ReferrerPolicyHeaderWriter.ReferrerPolicy
                                    .STRICT_ORIGIN_WHEN_CROSS_ORIGIN))
                    .contentSecurityPolicy(
                        csp ->
                            csp.policyDirectives("default-src 'none'; frame-ancestors 'none';")));

    return http.build();
  }
}
