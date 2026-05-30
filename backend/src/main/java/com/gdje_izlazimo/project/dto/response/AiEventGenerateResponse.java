package com.gdje_izlazimo.project.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.LocalDateTime;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record AiEventGenerateResponse(
        String name,
        String description,
        LocalDateTime eventDateTime,
        Double confidence
) {}