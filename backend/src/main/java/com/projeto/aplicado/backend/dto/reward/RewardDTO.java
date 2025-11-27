package com.projeto.aplicado.backend.dto.reward;

import lombok.Data;

@Data
public class RewardDTO {
    private String partnerId;
    private String title;
    private String description;
    private int requiredPoints;
    private int stock;
}
