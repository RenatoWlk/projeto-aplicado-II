package com.projeto.aplicado.backend.dto.bloodbank;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SlotDTO {

    private LocalTime time;
    private Integer availableSpots;

}
