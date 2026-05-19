package com.krishisetu.service;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.krishisetu.dto.CropEntry;
import edu.umd.cs.findbugs.annotations.SuppressFBWarnings;
import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.io.InputStream;
import java.util.Collections;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

/**
 * Component responsible for loading and parsing the static ICAR/Karnataka Crop Matrix JSON file on
 * application startup, exposing it as an immutable list of crop requirements.
 */
@Component
@SuppressFBWarnings({"EI_EXPOSE_REP", "EI_EXPOSE_REP2"})
public class CropMatrixLoader {

  private static final Logger LOG = LoggerFactory.getLogger(CropMatrixLoader.class);
  private final ObjectMapper objectMapper;
  private List<CropEntry> crops = Collections.emptyList();

  /** Wrapper representing the complete schema of crop_matrix.json. */
  @SuppressFBWarnings({"EI_EXPOSE_REP", "EI_EXPOSE_REP2"})
  public record CropMatrixWrapper(
      @JsonProperty("_comment") String comment, List<CropEntry> crops) {}

  /**
   * Constructs the CropMatrixLoader.
   *
   * @param objectMapper Spring-managed ObjectMapper for JSON deserialization
   */
  public CropMatrixLoader(final ObjectMapper objectMapper) {
    this.objectMapper = objectMapper;
  }

  /**
   * Initializes the loader by loading and parsing data/crop_matrix.json from the classpath.
   *
   * @throws IllegalStateException if the crop matrix resource is missing or malformed
   */
  @PostConstruct
  public void init() {
    try {
      final var resource = new ClassPathResource("data/crop_matrix.json");
      if (!resource.exists()) {
        throw new IllegalStateException(
            "Required crop_matrix.json data file is missing from classpath.");
      }
      try (InputStream is = resource.getInputStream()) {
        final var wrapper = objectMapper.readValue(is, CropMatrixWrapper.class);
        this.crops = List.copyOf(wrapper.crops());
        LOG.info("Successfully loaded {} crops from crop matrix metadata.", crops.size());
      }
    } catch (IOException e) {
      throw new IllegalStateException("Failed to parse crop_matrix.json correctly.", e);
    }
  }

  /**
   * Returns the parsed immutable list of crop requirements.
   *
   * @return list of CropEntry records
   */
  public List<CropEntry> getCrops() {
    return crops;
  }
}
