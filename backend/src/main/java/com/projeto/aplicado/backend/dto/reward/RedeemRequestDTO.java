package com.projeto.aplicado.backend.dto.reward;

import lombok.Data;

@Data
public class RedeemRequestDTO {
    private String rewardId;
    private String userId;
}