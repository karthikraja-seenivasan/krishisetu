package com.krishisetu.dto;

import java.math.BigDecimal;

/** DTO representing a specific mandi agricultural price entry from Agmarknet. */
public record MandiPriceEntry(
    String state,
    String district,
    String market,
    String commodity,
    String variety,
    String grade,
    String arrivalDate,
    BigDecimal minPrice,
    BigDecimal maxPrice,
    BigDecimal modalPrice) {}
