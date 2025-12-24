package com.gdje_izlazimo.project.exception;

import lombok.Getter;

import java.time.LocalDateTime;
@Getter
public class ApiError {

    private final int status;
    private final LocalDateTime timestamp;
    private final String message;
    private final String errorCode;

    public ApiError(int status, String message, String errorCode){

        this.status = status;
        this.timestamp = LocalDateTime.now();
        this.message = message;
        this.errorCode = errorCode;
    }



}
