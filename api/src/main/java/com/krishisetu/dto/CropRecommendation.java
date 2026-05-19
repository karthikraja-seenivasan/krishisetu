package com.krishisetu.dto;

import edu.umd.cs.findbugs.annotations.SuppressFBWarnings;

/**
 * Represents a calculated crop recommendation for the farmer, summarizing the suitability score,
 * explanatory rationale, and detailed economic projections.
 */
@SuppressFBWarnings({"EI_EXPOSE_REP", "EI_EXPOSE_REP2"})
public record CropRecommendation(
    String cropId,
    String cropNameEn,
    String cropNameKn,
    int suitabilityScore,
    String rationale,
    double expectedYieldQPerAcre,
    ExpectedPriceBand expectedPriceBandPerQ,
    double inputCostPerAcre,
    ProjectedNetReturn projectedNetReturnPerAcre) {

  /**
   * Price band representing the low, high, and expected modal price per quintal.
   *
   * @param low minimum expected price per quintal in INR
   * @param high maximum expected price per quintal in INR
   * @param modal most probable price per quintal in INR
   */
  public record ExpectedPriceBand(double low, double high, double modal) {}

  /**
   * Projected range of net economic returns (yield * price - cost) per acre.
   *
   * @param low worst case net returns in INR
   * @param high best case net returns in INR
   */
  public record ProjectedNetReturn(double low, double high) {}
}
