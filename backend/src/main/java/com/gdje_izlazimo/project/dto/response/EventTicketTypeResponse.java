package com.gdje_izlazimo.project.dto.response;

import java.math.BigDecimal;
import java.util.UUID;

public record EventTicketTypeResponse(
        UUID id,
        String name,
        String description,
        BigDecimal price,
        String currency,
        String purchaseUrl,
        Integer displayOrder
) {}