package com.projeto.aplicado.backend.dto;

import com.projeto.aplicado.backend.model.Address;
import lombok.Data;

import java.time.LocalDate;

@Data
public class CampaignDTO {
    private String bloodbankEmail;
    private String title;
    private String body;
    private LocalDate startDate;
    private LocalDate endDate;
    private Address location;
    private String phone;
}
