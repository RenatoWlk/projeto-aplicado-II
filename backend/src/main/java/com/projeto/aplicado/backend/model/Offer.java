package com.projeto.aplicado.backend.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data @NoArgsConstructor @AllArgsConstructor
public class Offer {
    private String title;
    private String body;
    private LocalDate validUntil;
    private BigDecimal discountPercentage;
}
