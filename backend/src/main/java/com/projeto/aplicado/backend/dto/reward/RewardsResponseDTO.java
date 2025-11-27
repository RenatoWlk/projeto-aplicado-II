package com.projeto.aplicado.backend.dto.reward;

import lombok.Data;

import java.util.List;

@Data
public class RewardsResponseDTO {
    private int userPoints;
    private List<RewardResponseDTO> rewards;
}