package com.projeto.aplicado.backend.dto.bloodbank;

import com.projeto.aplicado.backend.model.DailyAvailability;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DailyAvailabilityDTO {

    private LocalDate date;
    private List<SlotDTO> slots;

}
