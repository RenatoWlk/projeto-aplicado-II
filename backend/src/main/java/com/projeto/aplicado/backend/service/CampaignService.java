package com.projeto.aplicado.backend.service;

import com.projeto.aplicado.backend.dto.CampaignDTO;
import com.projeto.aplicado.backend.model.Campaign;
import com.projeto.aplicado.backend.repository.BloodBankRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

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
     * @param dto the campaign DTO containing campaign details
     * @return the created campaign DTO
     */
    public CampaignDTO create(CampaignDTO dto) {
        var bb = bloodBankRepository.findByEmail(dto.getBloodbankEmail())
                .orElseThrow(() -> new RuntimeException("Bloodbank email not found"));

        Campaign camp = new Campaign();
        camp.setTitle(dto.getTitle());
        camp.setBody(dto.getBody());
        camp.setStartDate(dto.getStartDate());
        camp.setEndDate(dto.getEndDate());
        camp.setPhone(bb.getPhone());
        camp.setLocation(bb.getAddress());

        // Add offer to partner
        bb.getCampaigns().add(camp);
        bloodBankRepository.save(bb);

        return toDTO(camp);
    }

    /**
     * Fetches all campaigns from the database and converts them to DTOs.
     * 
     * @return a list of CampaignDTO objects representing all campaigns.
     */
    public List<CampaignDTO> getAllCampaigns() {
        return bloodBankRepository.findAllBloodBanks().stream()
                .flatMap(b -> b.getCampaigns().stream())
                .map(c -> {
                    CampaignDTO dto = new CampaignDTO();
                    dto.setTitle(c.getTitle());
                    dto.setBody(c.getBody());
                    dto.setStartDate(c.getStartDate());
                    dto.setEndDate(c.getEndDate());
                    dto.setLocation(c.getLocation());
                    dto.setPhone(c.getPhone());
                    return dto;
                }).toList();
    }

    private CampaignDTO toDTO(Campaign campaign) {
        CampaignDTO dto = new CampaignDTO();
        dto.setTitle(campaign.getTitle());
        dto.setBody(campaign.getBody());
        dto.setStartDate(campaign.getStartDate());
        dto.setEndDate(campaign.getEndDate());
        dto.setLocation(campaign.getLocation());
        dto.setPhone(campaign.getPhone());
        return dto;
    }
}

