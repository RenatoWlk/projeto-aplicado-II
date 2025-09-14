package com.projeto.aplicado.backend.model.leaderboards;

import com.projeto.aplicado.backend.model.enums.BloodType;
import lombok.Data;

@Data
public class TopDonor {
    private String name;
    private int totalDonations;
    private BloodType bloodType;
}
