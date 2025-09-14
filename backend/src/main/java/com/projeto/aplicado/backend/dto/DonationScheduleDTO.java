package com.projeto.aplicado.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Data @NoArgsConstructor
@AllArgsConstructor
public class DonationScheduleDTO {
    private String userId;
    private String bloodBankId;
    private LocalDate date;
    private LocalTime hour;
}
