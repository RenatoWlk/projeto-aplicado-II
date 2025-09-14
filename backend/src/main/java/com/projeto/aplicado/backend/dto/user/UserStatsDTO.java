package com.projeto.aplicado.backend.dto.user;

import com.projeto.aplicado.backend.model.achievement.Achievement;
import com.projeto.aplicado.backend.model.enums.BloodType;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class UserStatsDTO {
    private BloodType bloodType;
    private int timesDonated;
    private int timeUntilNextDonation;
    private LocalDate lastDonationDate;
    private List<Achievement> achievements;
    private int totalPoints;
}
