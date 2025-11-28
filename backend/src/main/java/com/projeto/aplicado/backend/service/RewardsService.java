package com.projeto.aplicado.backend.service;

import com.projeto.aplicado.backend.dto.reward.RedeemRequestDTO;
import com.projeto.aplicado.backend.dto.reward.RewardDTO;
import com.projeto.aplicado.backend.dto.reward.RewardResponseDTO;
import com.projeto.aplicado.backend.dto.reward.RewardsResponseDTO;
import com.projeto.aplicado.backend.exception.UserNotFoundException;
import com.projeto.aplicado.backend.model.Reward;
import com.projeto.aplicado.backend.model.users.Partner;
import com.projeto.aplicado.backend.model.users.User;
import com.projeto.aplicado.backend.model.enums.Role;
import com.projeto.aplicado.backend.repository.PartnerRepository;
import com.projeto.aplicado.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.bson.types.ObjectId;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class RewardsService {
    private final PartnerRepository partnerRepository;
    private final UserRepository userRepository;

    /**
     * Returns a response containing the user's points and the list of rewards.
     * Each RewardResponseDTO.redeemed is set according to user's redeemedRewardsIds.
     */
    public RewardsResponseDTO getAllRewards(String userId) {
        User user = userRepository.findUserById(userId)
                .orElseThrow(() -> new UserNotFoundException(Role.USER, "User not found"));

        List<RewardResponseDTO> dtoList = new ArrayList<>();

        List<Partner> partners = partnerRepository.findAll();

        for (Partner partner : partners) {
            for (Reward reward : partner.getRewards()) {
                RewardResponseDTO dto = dtoToModel(reward, partner);
                dto.setRedeemed(user.getRedeemedRewardsIds() != null && user.getRedeemedRewardsIds().contains(reward.getId()));
                dtoList.add(dto);
            }
        }

        RewardsResponseDTO response = new RewardsResponseDTO();
        response.setUserPoints(user.getTotalPoints());
        response.setRewards(dtoList);
        return response;
    }

    public RewardResponseDTO create(RewardDTO dto) {
        if (dto.getPartnerId() == null || dto.getPartnerId().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "partnerEmail is required");
        }
        if (dto.getTitle() == null || dto.getTitle().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "title is required");
        }
        if (dto.getDescription() == null || dto.getDescription().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "description is required");
        }
        if (dto.getRequiredPoints() <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "requiredPoints must be greater than 0");
        }
        if (dto.getStock() < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "stock cannot be negative");
        }

        Partner partner = partnerRepository.findById(dto.getPartnerId())
                .orElseThrow(() -> new UserNotFoundException(Role.PARTNER, "Partner not found with id provided"));

        Reward reward = new Reward();
        reward.setId(new ObjectId().toHexString());
        reward.setTitle(dto.getTitle());
        reward.setDescription(dto.getDescription());
        reward.setRequiredPoints(dto.getRequiredPoints());
        reward.setStock(dto.getStock());
        reward.setPartnerId(partner.getId());

        partner.getRewards().add(reward);
        partnerRepository.save(partner);

        RewardResponseDTO response = dtoToModel(reward, partner);
        response.setRedeemed(false);
        return response;
    }

    public void deleteReward(String partnerId, String rewardId) {
        Partner partner = partnerRepository.findById(partnerId)
                .orElseThrow(() -> new UserNotFoundException(Role.PARTNER, "Partner not found"));

        boolean removed = partner.getRewards().removeIf(r -> r.getId().equals(rewardId));

        if (!removed) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Reward not found");
        }

        partnerRepository.save(partner);
    }

    /**
     * Redeem a reward for a user. Backend is authoritative.
     * This method:
     *  - checks user exists
     *  - locates partner that owns reward
     *  - checks user has not already redeemed reward
     *  - checks points requirement (user must have >= requiredPoints)
     *  - checks stock > 0
     *  - decrements reward stock by 1
     *  - adds rewardId to user's redeemedRewardsIds
     * Note: per product rule, we DO NOT subtract points from user.totalPoints here.
     */
    public void redeemReward(RedeemRequestDTO req) {
        User user = userRepository.findUserById(req.getUserId())
                .orElseThrow(() -> new UserNotFoundException(Role.USER, "User not found"));

        // Find partner that contains the reward
        Partner partner = partnerRepository.findByRewardId(req.getRewardId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Reward not found"));

        Optional<Reward> rewardOpt = partner.getRewards()
                .stream()
                .filter(r -> r.getId().equals(req.getRewardId()))
                .findFirst();

        if (rewardOpt.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Reward not found");
        }

        Reward reward = rewardOpt.get();

        if (user.getRedeemedRewardsIds() != null && user.getRedeemedRewardsIds().contains(reward.getId())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Reward already redeemed by user");
        }

        if (user.getTotalPoints() < reward.getRequiredPoints()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Not enough points");
        }

        if (reward.getStock() <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Reward out of stock");
        }

        reward.setStock(reward.getStock() - 1);

        if (user.getRedeemedRewardsIds() == null) {
            user.setRedeemedRewardsIds(new ArrayList<>());
        }
        user.getRedeemedRewardsIds().add(reward.getId());

        partnerRepository.save(partner);
        userRepository.save(user);
    }

    private RewardResponseDTO dtoToModel(Reward reward, Partner partner) {
        RewardResponseDTO dto = new RewardResponseDTO();
        dto.setId(reward.getId());
        dto.setTitle(reward.getTitle());
        dto.setPartnerName(partner.getName());
        dto.setDescription(reward.getDescription());
        dto.setRequiredPoints(reward.getRequiredPoints());
        dto.setStock(reward.getStock());
        dto.setRedeemed(false);
        return dto;
    }
}