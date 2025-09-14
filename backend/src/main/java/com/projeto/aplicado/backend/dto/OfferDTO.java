package com.projeto.aplicado.backend.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class OfferDTO {
    private String partnerEmail;
    private String partnerName;
    private String title;
    private String body;
    private LocalDate validUntil;
    private BigDecimal discountPercentage;
}
