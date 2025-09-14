package com.projeto.aplicado.backend.service;

import com.projeto.aplicado.backend.dto.OfferDTO;
import com.projeto.aplicado.backend.model.Offer;
import com.projeto.aplicado.backend.repository.PartnerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class OfferService {
    private final PartnerRepository partnerRepository;

    @Autowired
    public OfferService(PartnerRepository partnerRepository) {
        this.partnerRepository = partnerRepository;
    }

    /**
     * Creates a new offer.
     *
     * @param dto the offer DTO containing offer details
     * @return the created offer DTO
     */
    public OfferDTO create(OfferDTO dto) {
        var partner = partnerRepository.findByEmail(dto.getPartnerEmail())
                .orElseThrow(() -> new RuntimeException("Partner name not found"));

        Offer offer = new Offer();
        offer.setTitle(dto.getTitle());
        offer.setBody(dto.getBody());
        offer.setValidUntil(dto.getValidUntil());
        offer.setDiscountPercentage(dto.getDiscountPercentage());

        partner.getOffers().add(offer);
        partnerRepository.save(partner);

        return toDTO(partner.getName(), offer);
    }

    /**
     * Fetches all offers from all partners.
     * 
     * @return a list of OfferDTO objects containing offer details.
     */
    public List<OfferDTO> getAllOffers() {
        return partnerRepository.findAllPartners().stream()
                .flatMap(partner -> partner.getOffers().stream()
                        .map(offer -> toDTO(partner.getName(), offer)))
                .toList();
    }

    private OfferDTO toDTO(String partnerName, Offer offer) {
        OfferDTO dto = new OfferDTO();
        dto.setPartnerName(partnerName);
        dto.setTitle(offer.getTitle());
        dto.setBody(offer.getBody());
        dto.setValidUntil(offer.getValidUntil());
        dto.setDiscountPercentage(offer.getDiscountPercentage());
        return dto;
    }
}

