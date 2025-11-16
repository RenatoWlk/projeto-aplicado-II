package com.projeto.aplicado.backend.dto.donation;

import com.projeto.aplicado.backend.model.enums.BloodType;
import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DonationStatsDTO {
    private Map<String, Integer> byStatus;
    private Map<String, Integer> byBloodType;
    private int totalDonations;
    private int completedDonations;
    private int pendingDonations;
    private int cancelledDonations;
}