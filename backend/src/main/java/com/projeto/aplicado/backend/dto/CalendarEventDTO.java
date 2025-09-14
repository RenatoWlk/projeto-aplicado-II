package com.projeto.aplicado.backend.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class CalendarEventDTO {
    private Long id;
    private String description;
    private LocalDate date;
}