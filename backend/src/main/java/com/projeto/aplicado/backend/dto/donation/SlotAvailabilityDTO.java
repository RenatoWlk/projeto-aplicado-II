package com.projeto.aplicado.backend.dto.donation;


import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class SlotAvailabilityDTO {
    private boolean available;
    private int slotsUsed;
    private int slotsRemaining;
}
