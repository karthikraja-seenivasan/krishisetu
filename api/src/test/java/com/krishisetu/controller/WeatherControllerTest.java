package com.krishisetu.controller;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.krishisetu.dto.WeatherSummary;
import com.krishisetu.service.WeatherService;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

/** Controller slice test validating parameters constraints and mapping formats. */
@WebMvcTest(WeatherController.class)
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
class WeatherControllerTest {

  @Autowired private MockMvc mockMvc;

  @MockBean private WeatherService weatherService;

  @Test
  @WithMockUser
  void testGetWeatherSuccess() throws Exception {
    final double lat = 13.0;
    final double lon = 78.0;

    final var mockSummary =
        new WeatherSummary(lat, lon, 25.5, 20.0, 30.0, 10.0, 0, "Sunny", 28.0, 5.5, List.of());

    when(weatherService.getWeatherSummary(lat, lon)).thenReturn(mockSummary);

    mockMvc
        .perform(
            get("/api/v1/weather")
                .param("lat", String.valueOf(lat))
                .param("lon", String.valueOf(lon))
                .contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.currentTemperature").value(25.5))
        .andExpect(jsonPath("$.condition").value("Sunny"));
  }

  @Test
  @WithMockUser
  void testGetWeatherInvalidParams() throws Exception {
    mockMvc
        .perform(
            get("/api/v1/weather")
                .param("lat", "100.0") // Latitude max is 90
                .param("lon", "78.0")
                .contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isBadRequest());
  }
}
