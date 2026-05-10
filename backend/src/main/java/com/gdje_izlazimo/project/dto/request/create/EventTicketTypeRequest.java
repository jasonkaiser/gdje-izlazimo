package com.gdje_izlazimo.project.dto.request.create;

import jakarta.validation.constraints.NotBlank;
import org.hibernate.validator.constraints.URL;

import java.math.BigDecimal;

public record EventTicketTypeRequest(

        @NotBlank(message = "Ticket type name is required")
        String name,

        String description,

        BigDecimal price,

        String currency,

        @NotBlank(message = "Purchase URL is required")
        @URL(message = "purchaseUrl must be a valid URL")
        String purchaseUrl,

        Integer displayOrder,

        Boolean active
) {}