package com.krishisetu.exception;

/** Exception thrown when an external upstream dependency/API returns an error. */
public class UpstreamException extends KrishisetuException {

  /**
   * Constructs a new UpstreamException with the specified message.
   *
   * @param message the detail message
   */
  public UpstreamException(final String message) {
    super(message);
  }

  /**
   * Constructs a new UpstreamException with the specified message and cause.
   *
   * @param message the detail message
   * @param cause the cause of the exception
   */
  public UpstreamException(final String message, final Throwable cause) {
    super(message, cause);
  }
}
