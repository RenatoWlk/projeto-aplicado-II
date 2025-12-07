package com.projeto.aplicado.backend.service;

import com.projeto.aplicado.backend.dto.CampaignDTO;
import com.projeto.aplicado.backend.exception.UserNotFoundException;
import com.projeto.aplicado.backend.model.Campaign;
import com.projeto.aplicado.backend.model.enums.Role;
import com.projeto.aplicado.backend.repository.BloodBankRepository;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class CampaignService {
    private final BloodBankRepository bloodBankRepository;

    @Autowired
    public CampaignService(BloodBankRepository bloodBankRepository) {
        this.bloodBankRepository = bloodBankRepository;
    }

    /**
     * Creates a new campaign.
     *
     * @param dto The campaign DTO containing campaign details.
     * @return The created campaign DTO.
     * @throws UserNotFoundException In case the blood bank was not found with the email provided.
     */
    public CampaignDTO create(CampaignDTO dto) throws UserNotFoundException {
        var bb = bloodBankRepository.findByEmail(dto.getBloodbankEmail())
                .orElseThrow(() -> new UserNotFoundException(Role.BLOODBANK, "Blood bank not found with email provided when creating a campaign"));

        Campaign camp = new Campaign();
        camp.setId(new ObjectId().toHexString());
        camp.setTitle(dto.getTitle());
        camp.setBody(dto.getBody());
        camp.setStartDate(dto.getStartDate());
        camp.setEndDate(dto.getEndDate());
        camp.setPhone(bb.getPhone());
        camp.setLocation(bb.getAddress());

        bb.getCampaigns().add(camp);
        bloodBankRepository.save(bb);

        return toCampaignDTO(camp);
    }

    public void deleteCampaign(String bloodBankId, String campaignId) {
        var bloodBank = bloodBankRepository.findById(bloodBankId)
                .orElseThrow(() -> new UserNotFoundException(Role.BLOODBANK, "Blood bank not found"));

        boolean assignedAnyId = false;
        for (var c : bloodBank.getCampaigns()) {
            if (c.getId() == null || c.getId().isBlank()) {
                c.setId(new ObjectId().toHexString());
                assignedAnyId = true;
            }
        }

        if (assignedAnyId) {
            bloodBankRepository.save(bloodBank);
        }

        boolean removed = bloodBank.getCampaigns().removeIf(c -> campaignId.equals(c.getId()));
        if (!removed) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Campaign not found");
        }

        bloodBankRepository.save(bloodBank);
    }

    /**
     * Fetches all campaigns from the database and converts them to DTOs.
     * 
     * @return A list of CampaignDTO objects representing all campaigns.
     */
    public List<CampaignDTO> getAllCampaigns() {
        return bloodBankRepository.findAllBloodBanks().stream()
                .flatMap(b -> b.getCampaigns().stream())
                .map(this::toCampaignDTO).toList();
    }

    private CampaignDTO toCampaignDTO(Campaign campaign) {
        CampaignDTO dto = new CampaignDTO();
        dto.setId(campaign.getId());
        dto.setTitle(campaign.getTitle());
        dto.setBody(campaign.getBody());
        dto.setStartDate(campaign.getStartDate());
        dto.setEndDate(campaign.getEndDate());
        dto.setLocation(campaign.getLocation());
        dto.setPhone(campaign.getPhone());
        return dto;
    }
}

