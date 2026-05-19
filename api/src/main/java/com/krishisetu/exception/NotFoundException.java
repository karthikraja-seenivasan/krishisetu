package com.krishisetu.exception;

/** Exception thrown when a requested resource is not found. */
public class NotFoundException extends KrishisetuException {

  /**
   * Constructs a new NotFoundException with the specified message.
   *
   * @param message the detail message
   */
  public NotFoundException(final String message) {
    super(message);
  }
}
