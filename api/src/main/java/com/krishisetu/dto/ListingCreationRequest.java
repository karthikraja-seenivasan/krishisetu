package com.krishisetu.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

/** DTO representing a request to create a crop sales listing. */
public record ListingCreationRequest(
    @NotNull(message = "Farmer ID cannot be null") UUID farmerId,
    @NotBlank(message = "Crop ID cannot be blank") String cropId,
    @NotNull(message = "Quantity cannot be null")
        @DecimalMin(value = "0.01", message = "Quantity in quintals must be greater than 0")
        BigDecimal quantityQ,
    @NotNull(message = "Harvest date cannot be null") LocalDate harvestDate,
    String photoUrl,
    @NotNull(message = "Expected price cannot be null")
        @DecimalMin(value = "0.01", message = "Expected price per quintal must be greater than 0")
        BigDecimal expectedPricePerQ) {}
