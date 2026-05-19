package com.krishisetu.dto;

import edu.umd.cs.findbugs.annotations.SuppressFBWarnings;

/** Represents a single crop's growth requirements and economic presets loaded from the matrix. */
@SuppressFBWarnings({"EI_EXPOSE_REP", "EI_EXPOSE_REP2"})
public record CropEntry(
    String cropId,
    String cropNameEn,
    String cropNameKn,
    double minRainfallMm,
    double maxRainfallMm,
    double minTempC,
    double maxTempC,
    double minSoilPh,
    double maxSoilPh,
    String preferredSoilTexture,
    double typicalInputCostPerAcre,
    double typicalYieldQPerAcre,
    int growthDurationDays,
    String waterRequirementLevel,
    TypicalPriceBand typicalPriceBand) {

  /** Represents a standard price band per quintal for the crop. */
  public record TypicalPriceBand(double low, double high, double modal) {}
}
