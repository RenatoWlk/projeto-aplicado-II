package com.projeto.aplicado.backend.dto.bloodbank;

import com.projeto.aplicado.backend.model.DonationsOverTime;
import com.projeto.aplicado.backend.model.enums.BloodType;
import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
public class BloodBankStatsDTO {
    private int totalDonations;
    private int scheduledDonations;
    private List<DonationsOverTime> donationsOverTime;
    private Map<BloodType, Integer> bloodTypeBloodBags;
}
