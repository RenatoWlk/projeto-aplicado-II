package com.projeto.aplicado.backend.service;

import com.projeto.aplicado.backend.dto.OfferDTO;
import com.projeto.aplicado.backend.exception.UserNotFoundException;
import com.projeto.aplicado.backend.model.Offer;
import com.projeto.aplicado.backend.model.enums.Role;
import com.projeto.aplicado.backend.model.users.Partner;
import com.projeto.aplicado.backend.repository.PartnerRepository;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

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
     * @param dto The offer DTO containing offer details.
     * @return The created offer DTO.
     * @throws UserNotFoundException In case the partner was not found with the email provided.
     */
    public OfferDTO create(OfferDTO dto) throws UserNotFoundException {
        var partner = partnerRepository.findByEmail(dto.getPartnerEmail())
                .orElseThrow(() -> new UserNotFoundException(Role.PARTNER, "Partner not found with email provided when creating an offer"));

        Offer offer = new Offer();
        offer.setId(new ObjectId().toHexString());
        offer.setTitle(dto.getTitle());
        offer.setBody(dto.getBody());
        offer.setValidUntil(dto.getValidUntil());
        offer.setDiscountPercentage(dto.getDiscountPercentage());

        partner.getOffers().add(offer);
        partnerRepository.save(partner);

        return toOfferDTO(partner.getName(), offer);
    }

    public void deleteOffer(String partnerId, String offerId) {
        Partner partner = partnerRepository.findById(partnerId)
                .orElseThrow(() -> new UserNotFoundException(Role.PARTNER, "Partner not found"));

        boolean removed = partner.getOffers().removeIf(o -> {
            String ofId = o.getId();
            if (ofId != null) {
                return o.getId().equals(offerId);
            }
            return false;
        });

        if (!removed) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Offer not found");
        }

        partnerRepository.save(partner);
    }

    /**
     * Fetches all offers from all partners.
     * 
     * @return a list of OfferDTO objects containing offer details.
     */
    public List<OfferDTO> getAllOffers() {
        return partnerRepository.findAllPartners().stream()
                .flatMap(partner -> partner.getOffers().stream()
                        .map(offer -> toOfferDTO(partner.getName(), offer)))
                .toList();
    }

    private OfferDTO toOfferDTO(String partnerName, Offer offer) {
        OfferDTO dto = new OfferDTO();
        dto.setId(offer.getId());
        dto.setPartnerName(partnerName);
        dto.setTitle(offer.getTitle());
        dto.setBody(offer.getBody());
        dto.setValidUntil(offer.getValidUntil());
        dto.setDiscountPercentage(offer.getDiscountPercentage());
        return dto;
    }
}

