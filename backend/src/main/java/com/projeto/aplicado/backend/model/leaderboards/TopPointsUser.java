package com.projeto.aplicado.backend.model.leaderboards;

import com.projeto.aplicado.backend.model.enums.BloodType;
import lombok.Data;

@Data
public class TopPointsUser {
    private String name;
    private int points;
    private BloodType bloodType;
}
