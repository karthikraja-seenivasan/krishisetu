package com.krishisetu.controller;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.krishisetu.dto.CropRecommendation;
import com.krishisetu.dto.Season;
import com.krishisetu.service.RecommendationService;
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

/** Controller slice test validating parameter constraints and crop recommendation formats. */
@WebMvcTest(CropController.class)
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
class CropControllerTest {

  @Autowired private MockMvc mockMvc;

  @MockBean private RecommendationService recommendationService;

  @Test
  @WithMockUser
  void testRecommendCropsSuccess() throws Exception {
    final double lat = 13.13;
    final double lon = 78.13;
    final var season = Season.KHARIF;

    final var mockRec =
        new CropRecommendation(
            "tomato",
            "Tomato",
            "ಟೊಮ್ಯಾಟೋ",
            87,
            "Highly suitable.",
            180.0,
            new CropRecommendation.ExpectedPriceBand(800.0, 1500.0, 1200.0),
            52000.0,
            new CropRecommendation.ProjectedNetReturn(92000.0, 218000.0));

    when(recommendationService.recommend(lat, lon, season)).thenReturn(List.of(mockRec));

    mockMvc
        .perform(
            get("/api/v1/crops/recommend")
                .param("lat", String.valueOf(lat))
                .param("lon", String.valueOf(lon))
                .param("season", season.name())
                .contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.season").value(season.name()))
        .andExpect(jsonPath("$.recommendations[0].cropId").value("tomato"))
        .andExpect(jsonPath("$.recommendations[0].suitabilityScore").value(87))
        .andExpect(jsonPath("$.recommendations[0].projectedNetReturnPerAcre.low").value(92000.0));
  }

  @Test
  @WithMockUser
  void testRecommendCropsInvalidParams() throws Exception {
    mockMvc
        .perform(
            get("/api/v1/crops/recommend")
                .param("lat", "110.0") // Latitude maximum is 90
                .param("lon", "78.13")
                .param("season", "KHARIF")
                .contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isBadRequest());
  }
}
