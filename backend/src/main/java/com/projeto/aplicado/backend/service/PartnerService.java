package com.projeto.aplicado.backend.service;

import com.projeto.aplicado.backend.constants.Messages;
import com.projeto.aplicado.backend.dto.partner.PartnerRequestDTO;
import com.projeto.aplicado.backend.dto.partner.PartnerResponseDTO;
import com.projeto.aplicado.backend.exception.UserNotFoundException;
import com.projeto.aplicado.backend.model.users.Partner;
import com.projeto.aplicado.backend.model.enums.Role;
import com.projeto.aplicado.backend.repository.PartnerRepository;
import lombok.RequiredArgsConstructor;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

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
        return dto;
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
        partner = partnerRepository.save(partner);
        return toResponseDTO(partner);
    }
}