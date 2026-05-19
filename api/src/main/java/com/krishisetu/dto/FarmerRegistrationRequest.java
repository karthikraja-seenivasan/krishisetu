package com.krishisetu.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/** DTO for registering a new farmer profile in the agricultural database. */
public record FarmerRegistrationRequest(
    @NotBlank(message = "Farmer name cannot be blank")
        @Size(max = 255, message = "Farmer name exceeds maximum limit")
        String name,
    @NotBlank(message = "Phone number cannot be blank")
        @Pattern(regexp = "^\\d{10}$", message = "Phone number must match the 10-digit standard")
        String phone,
    @NotBlank(message = "District cannot be blank")
        @Size(max = 255, message = "District name exceeds maximum limit")
        String district,
    @NotBlank(message = "Preferred language cannot be blank")
        @Pattern(regexp = "^(en|kn)$", message = "Language must be English (en) or Kannada (kn)")
        String preferredLang) {}
