package com.gdje_izlazimo.project.exception.custom;

public class RatingNotAllowedException extends RuntimeException {
    public RatingNotAllowedException(String message) {
        super(message);
    }
}
