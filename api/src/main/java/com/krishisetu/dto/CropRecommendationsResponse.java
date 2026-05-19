package com.krishisetu.dto;

import edu.umd.cs.findbugs.annotations.SuppressFBWarnings;
import java.util.List;

/**
 * Response object wrapping the selected season and the computed list of top crop recommendations.
 */
@SuppressFBWarnings({"EI_EXPOSE_REP", "EI_EXPOSE_REP2"})
public record CropRecommendationsResponse(
    Season season, List<CropRecommendation> recommendations) {}
