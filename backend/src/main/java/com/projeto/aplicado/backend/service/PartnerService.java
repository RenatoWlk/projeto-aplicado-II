package com.projeto.aplicado.backend.service;

import com.projeto.aplicado.backend.constants.Messages;
import com.projeto.aplicado.backend.dto.CampaignDTO;
import com.projeto.aplicado.backend.dto.OfferDTO;
import com.projeto.aplicado.backend.dto.partner.PartnerRequestDTO;
import com.projeto.aplicado.backend.dto.partner.PartnerResponseDTO;
import com.projeto.aplicado.backend.dto.reward.RewardResponseDTO;
import com.projeto.aplicado.backend.exception.UserNotFoundException;
import com.projeto.aplicado.backend.model.Campaign;
import com.projeto.aplicado.backend.model.Offer;
import com.projeto.aplicado.backend.model.Reward;
import com.projeto.aplicado.backend.model.users.BloodBank;
import com.projeto.aplicado.backend.model.users.Partner;
import com.projeto.aplicado.backend.model.enums.Role;
import com.projeto.aplicado.backend.repository.PartnerRepository;
import lombok.RequiredArgsConstructor;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PartnerService {
    private final PartnerRepository partnerRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * Creates a new partner.
     * 
     * @param dto the partner request DTO containing the partner's details
     * @return the created partner response DTO
     */
    public PartnerResponseDTO create(PartnerRequestDTO dto) {
        Partner partner = new Partner();
        partner.setName(dto.getName());
        partner.setEmail(dto.getEmail());
        partner.setPassword(passwordEncoder.encode(dto.getPassword()));
        partner.setAddress(dto.getAddress());
        partner.setPhone(dto.getPhone());
        partner.setRole(Role.PARTNER);
        partner.setCnpj(dto.getCnpj());
        partner.setOffers(dto.getOffers());
        partner.setRewards(dto.getRewards());

        partner = partnerRepository.save(partner);
        return toResponseDTO(partner);
    }

    /**
     * Finds a partner by ID.
     * 
     * @param id The ID of the partner to find.
     * @return The partner response DTO.
     * @throws UserNotFoundException In case the partner was not found with ID provided.
     */
    public PartnerResponseDTO findById(String id) throws UserNotFoundException {
        return partnerRepository.findPartnerById(id)
                .map(this::toResponseDTO)
                .orElseThrow(() -> new UserNotFoundException(Role.PARTNER, "Partner not found with ID provided when finding by ID"));
    }

    /**
     * Retrieves all the offers for a specific partner.
     *
     * @param id the ID of the partner
     * @return a list containing all the offers from the partner
     */
    public List<OfferDTO> findOffersById(String id) {
        return partnerRepository.findPartnerById(id)
                .map(this::toOfferDTO)
                .orElseThrow(() -> new UserNotFoundException(Role.PARTNER, Messages.USER_NOT_FOUND));
    }

    /**
     * Retrieves all the rewards for a specific partner.
     *
     * @param id the ID of the partner
     * @return a list containing all the rewards from the partner
     */
    public List<RewardResponseDTO> findRewardsById(String id) {
        return partnerRepository.findPartnerById(id)
                .map(this::toRewardDTO)
                .orElseThrow(() -> new UserNotFoundException(Role.PARTNER, Messages.USER_NOT_FOUND));
    }

    private PartnerResponseDTO toResponseDTO(Partner partner) {
        PartnerResponseDTO dto = new PartnerResponseDTO();
        dto.setId(partner.getId());
        dto.setName(partner.getName());
        dto.setEmail(partner.getEmail());
        dto.setAddress(partner.getAddress());
        dto.setPhone(partner.getPhone());
        dto.setRole(partner.getRole());
        dto.setCnpj(partner.getCnpj());
        dto.setOffers(partner.getOffers());
        dto.setRewards(partner.getRewards());
        return dto;
    }

    /**
     * Converts a Partner entity to a DTO containing all the offers.
     *
     * @param partner the partner entity
     * @return the list of offers DTOs
     */
    private List<OfferDTO> toOfferDTO(Partner partner) {
        List<OfferDTO> dtoList = new ArrayList<>();

        for (Offer offer : partner.getOffers()) {
            OfferDTO dto = new OfferDTO();
            dto.setId(offer.getId());
            dto.setPartnerEmail(partner.getEmail());
            dto.setPartnerName(partner.getName());
            dto.setTitle(offer.getTitle());
            dto.setBody(offer.getBody());
            dto.setValidUntil(offer.getValidUntil());
            dto.setDiscountPercentage(offer.getDiscountPercentage());
            dtoList.add(dto);
        }

        return dtoList;
    }

    /**
     * Converts a Partner entity to a DTO containing all the rewards.
     *
     * @param partner the partner entity
     * @return the list of rewards DTOs
     */
    private List<RewardResponseDTO> toRewardDTO(Partner partner) {
        List<RewardResponseDTO> dtoList = new ArrayList<>();

        for (Reward reward : partner.getRewards()) {
            RewardResponseDTO dto = new RewardResponseDTO();
            dto.setId(reward.getId());
            dto.setTitle(reward.getTitle());
            dto.setPartnerName(partner.getName());
            dto.setDescription(reward.getDescription());
            dto.setRequiredPoints(reward.getRequiredPoints());
            dto.setStock(reward.getStock());
            dtoList.add(dto);
        }

        return dtoList;
    }

    /**
     * Updates an existing partner.
     * 
     * @param id The ID of the partner to update.
     * @param dto The partner request DTO containing the updated details.
     * @return The updated partner response DTO.
     * @throws UserNotFoundException In case the partner was not found with ID provided.
     */
    public PartnerResponseDTO update(String id, PartnerRequestDTO dto) throws UserNotFoundException {
        Partner partner = partnerRepository.findPartnerById(id)
                .orElseThrow(() -> new UserNotFoundException(Role.PARTNER, "Partner not found with ID provided when updating"));

        partner.setName(dto.getName());
        partner.setEmail(dto.getEmail());
        partner.setAddress(dto.getAddress());
        partner.setPhone(dto.getPhone());
        partner.setCnpj(dto.getCnpj());
        partner.setOffers(dto.getOffers());
        partner.setRewards(dto.getRewards());
        partner = partnerRepository.save(partner);
        return toResponseDTO(partner);
    }
}