package com.krishisetu.dto;

/**
 * Standard API error response payload returned on failures.
 *
 * @param code the error classification code (e.g. VALIDATION, NOT_FOUND, UPSTREAM, INTERNAL)
 * @param message detail explanation of the error
 */
public record ApiError(String code, String message) {}
