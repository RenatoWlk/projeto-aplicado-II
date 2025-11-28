package com.projeto.aplicado.backend.controller;

import com.projeto.aplicado.backend.dto.reward.RedeemRequestDTO;
import com.projeto.aplicado.backend.dto.reward.RewardDTO;
import com.projeto.aplicado.backend.dto.reward.RewardResponseDTO;
import com.projeto.aplicado.backend.dto.reward.RewardsResponseDTO;
import com.projeto.aplicado.backend.service.RewardsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/rewards")
@RequiredArgsConstructor
public class RewardsController {
    private final RewardsService rewardsService;

    @GetMapping("/{userId}")
    public ResponseEntity<RewardsResponseDTO> getRewards(@PathVariable String userId) {
        return ResponseEntity.ok(rewardsService.getAllRewards(userId));
    }

    @PostMapping("/redeem")
    public ResponseEntity<Void> redeem(@RequestBody RedeemRequestDTO dto) {
        rewardsService.redeemReward(dto);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/create")
    public ResponseEntity<RewardResponseDTO> create(@RequestBody RewardDTO dto) {
        return ResponseEntity.ok(rewardsService.create(dto));
    }

    @DeleteMapping("/delete/{partnerId}/{rewardId}")
    public ResponseEntity<Void> deleteReward(
            @PathVariable String partnerId,
            @PathVariable String rewardId
    ) {
        rewardsService.deleteReward(partnerId, rewardId);
        return ResponseEntity.noContent().build();
    }
}