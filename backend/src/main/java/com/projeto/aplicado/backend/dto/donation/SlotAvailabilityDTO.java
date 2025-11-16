// SlotAvailabilityDTO.java
package com.projeto.aplicado.backend.dto.donation;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SlotAvailabilityDTO {
    private boolean available;
    private int slotsUsed;
    private int slotsRemaining;
}