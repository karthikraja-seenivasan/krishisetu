package com.krishisetu.exception;

/**
 * Base exception class for the KrishiSetu application. All custom exceptions should extend this.
 */
public class KrishisetuException extends RuntimeException {

  /**
   * Constructs a new KrishisetuException with the specified message.
   *
   * @param message the detail message
   */
  public KrishisetuException(final String message) {
    super(message);
  }

  /**
   * Constructs a new KrishisetuException with the specified message and cause.
   *
   * @param message the detail message
   * @param cause the cause of the exception
   */
  public KrishisetuException(final String message, final Throwable cause) {
    super(message, cause);
  }
}
