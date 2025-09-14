package com.projeto.aplicado.backend.controller;

import com.projeto.aplicado.backend.dto.CampaignDTO;
import com.projeto.aplicado.backend.dto.LeaderboardsDTO;
import com.projeto.aplicado.backend.dto.OfferDTO;
import com.projeto.aplicado.backend.dto.bloodbank.BloodBankNearbyDTO;
import com.projeto.aplicado.backend.service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardContentController {
    private final OfferService offerService;
    private final CampaignService campaignService;
    private final BloodBankService bloodBankService;
    private final LeaderboardsService leaderboardsService;

    @Autowired
    public DashboardContentController(OfferService offerService, CampaignService campaignService, BloodBankService bloodBankService, LeaderboardsService leaderboardsService) {
        this.offerService = offerService;
        this.campaignService = campaignService;
        this.bloodBankService = bloodBankService;
        this.leaderboardsService = leaderboardsService;
    }

    /**
     * Gets all offers for the dashboard.
     *
     * @return a list of offers
     */
    @GetMapping("/offers")
    public ResponseEntity<List<OfferDTO>> getAllOffers() {
        return ResponseEntity.ok(offerService.getAllOffers());
    }

    /**
     * Gets all campaigns for the dashboard.
     *
     * @return a list of campaigns
     */
    @GetMapping("/campaigns")
    public ResponseEntity<List<CampaignDTO>> getAllCampaigns() {
        return ResponseEntity.ok(campaignService.getAllCampaigns());
    }

    /**
     * Creates a new campaign
     *
     * @return the new campaign created
     */
    @PostMapping("/campaign/create")
    public ResponseEntity<CampaignDTO> createCampaign(@RequestBody CampaignDTO campaignDTO) {
        return ResponseEntity.ok(campaignService.create(campaignDTO));
    }

    /**
     * Creates a new offer
     *
     * @return the new offer created
     */
    @PostMapping("/offer/create")
    public ResponseEntity<OfferDTO> createOffer(@RequestBody OfferDTO offerDTO) {
        return ResponseEntity.ok(offerService.create(offerDTO));
    }

    /**
     * Gets nearby blood banks from the user.
     *
     * @return a list of campaigns
     */
    @GetMapping("/{id}/nearbyBloodbanks")
    public ResponseEntity<List<BloodBankNearbyDTO>> getNearbyBloodbanks(@PathVariable String id) {
        return ResponseEntity.ok(bloodBankService.getNearbyBloodbanksFromUser(id));
    }

    /**
     * Gets the leaderboards (top donors and top points)
     *
     * @return a leaderboards DTO with top donors and top points lists
     */
    @GetMapping("/leaderboards")
    public ResponseEntity<LeaderboardsDTO> getLeaderboards() {
        return ResponseEntity.ok(leaderboardsService.getLeaderboards());
    }
}
