package com.projeto.aplicado.backend.controller;

import com.projeto.aplicado.backend.dto.OfferDTO;
import com.projeto.aplicado.backend.dto.partner.PartnerRequestDTO;
import com.projeto.aplicado.backend.dto.partner.PartnerResponseDTO;
import com.projeto.aplicado.backend.dto.reward.RewardResponseDTO;
import com.projeto.aplicado.backend.service.OfferService;
import com.projeto.aplicado.backend.service.PartnerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/partners")
@RequiredArgsConstructor
public class PartnerController {
    private final PartnerService partnerService;
    private final OfferService offerService;

    /**
     * Creates a new partner.
     * 
     * @param dto the partner request DTO
     * @return the created partner response DTO
     */
    @PostMapping("/create")
    public ResponseEntity<PartnerResponseDTO> create(@RequestBody PartnerRequestDTO dto) {
        return ResponseEntity.ok(partnerService.create(dto));
    }

    /**
     * Get an existing partner.
     * 
     * @param id the ID of the partner to get
     * @return the partner response DTO
     */
    @GetMapping("/{id}")
    public ResponseEntity<PartnerResponseDTO> getById(@PathVariable String id) {
        return ResponseEntity.ok(partnerService.findById(id));
    }

    /**
     * Updates a partner account by ID.
     *
     * @param id the ID of the partner to be updated.
     * @param dto the response DTO with the data to update the partner.
     * @return the partner response DTO with the partner updated data.
     */
    @PutMapping("/{id}")
    public ResponseEntity<PartnerResponseDTO> updatePartner(@PathVariable String id, @RequestBody PartnerRequestDTO dto) {
        return ResponseEntity.ok(partnerService.update(id, dto));
    }

    /**
     * Get the offers of a partner by ID.
     *
     * @param id the ID of partner to retrieve the offers
     * @return the partner offers DTO
     */
    @GetMapping("/{id}/offers")
    public ResponseEntity<List<OfferDTO>> getOffersById(@PathVariable String id) {
        return ResponseEntity.ok(partnerService.findOffersById(id));
    }

    @DeleteMapping("/{partnerId}/offers/{offerId}")
    public ResponseEntity<Void> deleteOfferById(@PathVariable String partnerId, @PathVariable String offerId) {
        offerService.deleteOffer(partnerId, offerId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Get the rewards of a partner by ID.
     *
     * @param id the ID of partner to retrieve the rewards
     * @return the partner rewards DTO
     */
    @GetMapping("/{id}/rewards")
    public ResponseEntity<List<RewardResponseDTO>> getRewardsById(@PathVariable String id) {
        return ResponseEntity.ok(partnerService.findRewardsById(id));
    }
}
