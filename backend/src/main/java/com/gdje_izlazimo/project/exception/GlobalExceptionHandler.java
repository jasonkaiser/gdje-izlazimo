package com.gdje_izlazimo.project.exception;

import com.gdje_izlazimo.project.exception.custom.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // General Handlers

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> handleGeneric(Exception ex){

        HttpStatus status = HttpStatus.INTERNAL_SERVER_ERROR;

        return ResponseEntity
                .status(status)
                .body(new ApiError(status.value(), ex.getMessage(), "INTERNAL_ERROR"));

    }

    // Events Handlers

    @ExceptionHandler(EventNotFoundException.class)
    public ResponseEntity<ApiError> handleEventNotFound(EventNotFoundException ex){

        HttpStatus status = HttpStatus.NOT_FOUND;

        return  ResponseEntity
                .status(status)
                .body(new ApiError(status.value(), ex.getMessage(), "EVENT_NOT_FOUND"));

    }

    // Rating Handlers

    @ExceptionHandler(RatingNotFoundException.class)
    public ResponseEntity<ApiError> handleRatingNotFound(RatingNotFoundException ex){

        HttpStatus status = HttpStatus.NOT_FOUND;

        return ResponseEntity
                .status(status)
                .body(new ApiError(status.value(), ex.getMessage(), "RATING_NOT_FOUND"));
    }

    @ExceptionHandler(RatingAlreadyExistsException.class)
    public ResponseEntity<ApiError> handleRatingAlreadyExists(RatingNotFoundException ex){

        HttpStatus status = HttpStatus.CONFLICT;

        return ResponseEntity
                .status(status)
                .body(new ApiError(status.value(), ex.getMessage(),"RATING_ALREADY_EXISTS"));

    }

    // Reservation Handlers

    @ExceptionHandler(ReservationNotFoundException.class)
    public ResponseEntity<ApiError> handleReservationNotFound(ReservationNotFoundException ex){

        HttpStatus status = HttpStatus.NOT_FOUND;

        return ResponseEntity
                .status(status)
                .body(new ApiError(status.value(), ex.getMessage(),"RESERVATION_NOT_FOUND"));

    }

    @ExceptionHandler(ReservationAlreadyExistsException.class)
    public ResponseEntity<ApiError> handleReservationAlreadyExists(ReservationAlreadyExistsException ex){

        HttpStatus status = HttpStatus.CONFLICT;

        return ResponseEntity
                .status(status)
                .body(new ApiError(status.value(), ex.getMessage(),"RESERVATION_ALREADY_EXISTS"));

    }

    // TableType Handlers

    @ExceptionHandler(TableTypeNotFoundException.class)
    public ResponseEntity<ApiError> handleTableTypeNotFound(TableTypeNotFoundException ex){

        HttpStatus status = HttpStatus.NOT_FOUND;

        return ResponseEntity
                .status(status)
                .body(new ApiError(status.value(), ex.getMessage(),"TABLE_TYPE_NOT_FOUND"));

    }

    // User Handlers

    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<ApiError> handleUserNotFound(UserNotFoundException ex){

        HttpStatus status = HttpStatus.NOT_FOUND;

        return ResponseEntity
                .status(status)
                .body(new ApiError(status.value(), ex.getMessage(),"USER_NOT_FOUND"));

    }
    @ExceptionHandler(EmailAlreadyExistsException.class)
    public ResponseEntity<ApiError> handleEmailAlreadyExists(EmailAlreadyExistsException ex){

        HttpStatus status = HttpStatus.CONFLICT;

        return ResponseEntity
                .status(status)
                .body(new ApiError(status.value(), ex.getMessage(),"EMAIL_ALREADY_EXISTS"));

    }

    // Venue Handlers

    @ExceptionHandler(VenueNotFoundException.class)
    public ResponseEntity<ApiError> handleVenueNotFound(VenueNotFoundException ex){

        HttpStatus status = HttpStatus.NOT_FOUND;

        return ResponseEntity
                .status(status)
                .body(new ApiError(status.value(), ex.getMessage(),"VENUE_NOT_FOUND"));

    }

    @ExceptionHandler(VenueAlreadyExistsException.class)
    public ResponseEntity<ApiError> handleVenueAlreadyExists(VenueAlreadyExistsException ex){

        HttpStatus status = HttpStatus.CONFLICT;

        return ResponseEntity
                .status(status)
                .body(new ApiError(status.value(), ex.getMessage(),"VENUE_ALREADY_EXISTS"));

    }

    @ExceptionHandler(VenueImageNotFoundException.class)
    public ResponseEntity<ApiError> handleVenueImageNotFound(VenueImageNotFoundException ex){

        HttpStatus status = HttpStatus.NOT_FOUND;

        return ResponseEntity
                .status(status)
                .body(new ApiError(status.value(), ex.getMessage(),"VENUE_IMAGE_NOT_FOUND"));

    }

    @ExceptionHandler(VenueOperatingHoursNotFoundException.class)
    public ResponseEntity<ApiError> handleVenueOperatingHoursNotFound(VenueOperatingHoursNotFoundException ex){

        HttpStatus status = HttpStatus.NOT_FOUND;

        return ResponseEntity
                .status(status)
                .body(new ApiError(status.value(), ex.getMessage(),"VENUE_OPERATING_HOURS_NOT_FOUND"));

    }

    @ExceptionHandler(VenueTableTypeNotFoundException.class)
    public ResponseEntity<ApiError> handleVenueTableTypeNotFound(VenueTableTypeNotFoundException ex){

        HttpStatus status = HttpStatus.NOT_FOUND;

        return ResponseEntity
                .status(status)
                .body(new ApiError(status.value(), ex.getMessage(),"VENUE_TABLE_TYPE_NOT_FOUND"));

    }

    @ExceptionHandler(VenueTableTypeAlreadyExistsException.class)
    public ResponseEntity<ApiError> handleVenueTableTypeAlreadyExists(VenueTableTypeAlreadyExistsException ex){

        HttpStatus status = HttpStatus.CONFLICT;

        return ResponseEntity
                .status(status)
                .body(new ApiError(status.value(), ex.getMessage(),"VENUE_TABLE_TYPE_ALREADY_EXISTS"));

    }
}
