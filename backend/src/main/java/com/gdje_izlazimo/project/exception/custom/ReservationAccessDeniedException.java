package com.gdje_izlazimo.project.exception.custom;

public class ReservationAccessDeniedException extends RuntimeException {
    public ReservationAccessDeniedException(String message) {
        super(message);
    }
}
