package com.projeto.aplicado.backend.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;


@Data
@NoArgsConstructor
@AllArgsConstructor
public class DailyAvailability {

    private LocalDate date;
    private List<Slot> slots;
}