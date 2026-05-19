package com.krishisetu.dto;

import java.util.List;

/** DTO wrapper for the list of mandi price entries returned by agricultural endpoints. */
public record MandiPricesResponse(List<MandiPriceEntry> records) {}
