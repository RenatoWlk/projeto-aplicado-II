package com.projeto.aplicado.backend.dto.reward;

import lombok.Data;

@Data
public class RewardResponseDTO {
    private String id;
    private String title;
    private String partnerName;
    private String description;
    private int requiredPoints;
    private int stock;
    private boolean redeemed;
}