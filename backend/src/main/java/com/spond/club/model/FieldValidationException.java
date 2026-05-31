package com.spond.club.model;

/**
 * Signals that a specific request field failed business-rule validation.
 * Carries the field name and a human-readable message as typed properties,
 * so callers never need to parse a "field:message" string.
 */
public class FieldValidationException extends RuntimeException {

    private final String field;

    public FieldValidationException(String field, String message) {
        super(message);
        this.field = field;
    }

    public String getField() {
        return field;
    }
}
