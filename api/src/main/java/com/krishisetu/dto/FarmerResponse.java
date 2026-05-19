package com.krishisetu.dto;

import java.time.Instant;
import java.util.UUID;

/** DTO representing the response payload for a registered farmer profile. */
public record FarmerResponse(
    UUID id, String name, String district, String preferredLang, Instant createdAt) {}
