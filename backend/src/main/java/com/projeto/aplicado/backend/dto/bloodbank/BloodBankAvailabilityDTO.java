package com.projeto.aplicado.backend.dto.bloodbank;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.projeto.aplicado.backend.dto.donation.DailyAvailabilityDTO;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BloodBankAvailabilityDTO {

    @NotNull
    private String id;

    @NotNull
    @JsonProperty("availabilitySlots")
    private List<DailyAvailabilityDTO> availability;

}