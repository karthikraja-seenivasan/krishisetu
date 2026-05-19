package com.krishisetu.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

/** DTO representing the response payload for a registered crop listing. */
public record ListingResponse(
    UUID id,
    UUID farmerId,
    String cropId,
    BigDecimal quantityQ,
    LocalDate harvestDate,
    String photoUrl,
    BigDecimal expectedPricePerQ,
    String status,
    Instant createdAt) {}
