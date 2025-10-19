package com.projeto.aplicado.backend.model;

import com.projeto.aplicado.backend.model.users.User;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


import java.time.LocalDate;
import java.time.LocalTime;

@Data @NoArgsConstructor @AllArgsConstructor
public class ScheduledDonation {
    private String bloodBankId;
    private LocalDate date;
    private String hour;
    private Integer slot;
    private String userId;
}
