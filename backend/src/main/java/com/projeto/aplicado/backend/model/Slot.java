package com.projeto.aplicado.backend.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Slot {
    private LocalTime time;
    private Integer totalSpots;
    private Integer bookedSpots;
    private Integer availableSpots;
}