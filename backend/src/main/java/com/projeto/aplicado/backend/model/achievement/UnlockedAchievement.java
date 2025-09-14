package com.projeto.aplicado.backend.model.achievement;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class UnlockedAchievement {
    private String achievementId;
    private LocalDateTime unlockedAt;
}

