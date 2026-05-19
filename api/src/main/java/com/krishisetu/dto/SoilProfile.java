package com.krishisetu.dto;

/**
 * Represents the soil profile of a farmer's plot location, specifying key soil qualities like pH,
 * organic carbon content, and particle size percentages.
 *
 * @param ph soil pH level
 * @param organicCarbonPercent percentage of organic carbon in soil
 * @param sandPercent sand content percentage (0-100)
 * @param siltPercent silt content percentage (0-100)
 * @param clayPercent clay content percentage (0-100)
 * @param texture visual text description of soil texture (e.g. "Sandy Loam")
 */
public record SoilProfile(
    double ph,
    double organicCarbonPercent,
    double sandPercent,
    double siltPercent,
    double clayPercent,
    String texture) {}
