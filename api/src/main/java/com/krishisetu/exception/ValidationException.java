package com.krishisetu.exception;

/** Exception thrown when manual business rule validation checks fail on data inputs. */
public class ValidationException extends KrishisetuException {

  /**
   * Constructs a new ValidationException.
   *
   * @param field the name of the invalid property field
   * @param message description of the validation failure constraint
   */
  public ValidationException(final String field, final String message) {
    super(field + ": " + message);
  }
}
