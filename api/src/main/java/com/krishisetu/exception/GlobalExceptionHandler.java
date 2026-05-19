package com.krishisetu.exception;

import com.krishisetu.dto.ApiError;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * Centralized exception handler that intercepts exceptions thrown by controllers and translates
 * them into standard ApiError payloads.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

  private static final Logger LOG = LoggerFactory.getLogger(GlobalExceptionHandler.class);

  /**
   * Handles NotFoundException mapping to 404 Not Found.
   *
   * @param ex the NotFoundException
   * @return standard error response
   */
  @ExceptionHandler(NotFoundException.class)
  public ResponseEntity<ApiError> handleNotFound(final NotFoundException ex) {
    LOG.warn("Resource not found: {}", ex.getMessage());
    return ResponseEntity.status(HttpStatus.NOT_FOUND)
        .body(new ApiError("NOT_FOUND", ex.getMessage()));
  }

  /**
   * Handles UpstreamException mapping to 502 Bad Gateway.
   *
   * @param ex the UpstreamException
   * @return standard error response
   */
  @ExceptionHandler(UpstreamException.class)
  public ResponseEntity<ApiError> handleUpstream(final UpstreamException ex) {
    LOG.error("Upstream API call failed: {}", ex.getMessage(), ex);
    return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
        .body(new ApiError("UPSTREAM_ERROR", ex.getMessage()));
  }

  /**
   * Handles KrishisetuException mapping to 400 Bad Request.
   *
   * @param ex the KrishisetuException
   * @return standard error response
   */
  @ExceptionHandler(KrishisetuException.class)
  public ResponseEntity<ApiError> handleKrishisetu(final KrishisetuException ex) {
    LOG.warn("Business rule violation: {}", ex.getMessage());
    return ResponseEntity.badRequest()
        .body(new ApiError("BUSINESS_RULE_VIOLATION", ex.getMessage()));
  }

  /**
   * Handles Bean Validation exceptions mapping to 400 Bad Request.
   *
   * @param ex the MethodArgumentNotValidException
   * @return standard error response
   */
  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<ApiError> handleValidation(final MethodArgumentNotValidException ex) {
    final var msg =
        ex.getBindingResult().getFieldErrors().stream()
            .map(e -> e.getField() + ": " + e.getDefaultMessage())
            .collect(Collectors.joining("; "));
    LOG.warn("Request validation failed: {}", msg);
    return ResponseEntity.badRequest().body(new ApiError("VALIDATION", msg));
  }

  /**
   * Handles HandlerMethodValidationException for query parameter constraints in Spring Boot 3.x.
   *
   * @param ex the HandlerMethodValidationException
   * @return standard error response
   */
  @ExceptionHandler(
      org.springframework.web.method.annotation.HandlerMethodValidationException.class)
  public ResponseEntity<ApiError> handleMethodValidation(
      final org.springframework.web.method.annotation.HandlerMethodValidationException ex) {
    final var msg =
        ex.getAllValidationResults().stream()
            .map(
                res ->
                    res.getMethodParameter().getParameterName()
                        + ": "
                        + res.getResolvableErrors().stream()
                            .map(
                                org.springframework.context.MessageSourceResolvable
                                    ::getDefaultMessage)
                            .collect(Collectors.joining(", ")))
            .collect(Collectors.joining("; "));
    LOG.warn("Parameter validation failed: {}", msg);
    return ResponseEntity.badRequest().body(new ApiError("VALIDATION", msg));
  }

  /**
   * Handles ConstraintViolationException for standard constraints validation failures.
   *
   * @param ex the ConstraintViolationException
   * @return standard error response
   */
  @ExceptionHandler(jakarta.validation.ConstraintViolationException.class)
  public ResponseEntity<ApiError> handleConstraintViolation(
      final jakarta.validation.ConstraintViolationException ex) {
    final var msg =
        ex.getConstraintViolations().stream()
            .map(v -> v.getPropertyPath() + ": " + v.getMessage())
            .collect(Collectors.joining("; "));
    LOG.warn("Constraint violation: {}", msg);
    return ResponseEntity.badRequest().body(new ApiError("VALIDATION", msg));
  }

  /**
   * Handles ValidationException mapping to 400 Bad Request with VALIDATION code.
   *
   * @param ex the ValidationException
   * @return standard error response
   */
  @ExceptionHandler(ValidationException.class)
  public ResponseEntity<ApiError> handleCustomValidation(final ValidationException ex) {
    LOG.warn("Manual validation check failed: {}", ex.getMessage());
    return ResponseEntity.badRequest().body(new ApiError("VALIDATION", ex.getMessage()));
  }

  /**
   * Handles any other unhandled exception mapping to 500 Internal Server Error.
   *
   * @param ex the Exception
   * @return standard error response
   */
  @ExceptionHandler(Exception.class)
  public ResponseEntity<ApiError> handleAny(final Exception ex) {
    LOG.error("Unhandled system exception: {}", ex.getMessage(), ex);
    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
        .body(new ApiError("INTERNAL", "An unexpected error occurred."));
  }
}
