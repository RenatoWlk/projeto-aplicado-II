package com.projeto.aplicado.backend.controller;

import com.projeto.aplicado.backend.dto.CampaignDTO;
import com.projeto.aplicado.backend.dto.DonationScheduleDTO;
import com.projeto.aplicado.backend.dto.bloodbank.*;
import com.projeto.aplicado.backend.dto.donation.AvailableSlotsDTO;
import com.projeto.aplicado.backend.dto.donation.DailyAvailabilityDTO;
import com.projeto.aplicado.backend.dto.donation.SlotDTO;
import com.projeto.aplicado.backend.model.DailyAvailability;
import com.projeto.aplicado.backend.model.Slot;
import com.projeto.aplicado.backend.model.users.BloodBank;
import com.projeto.aplicado.backend.service.BloodBankService;
import com.projeto.aplicado.backend.service.CampaignService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bloodbanks")
@RequiredArgsConstructor
public class BloodBankController {
    private final BloodBankService bloodBankService;
    private final CampaignService campaignService;

    /**
     * Creates a new blood bank.
     *
     * @param dto the blood bank request DTO
     * @return the created blood bank response DTO
     */
    @PostMapping("/create")
    public ResponseEntity<BloodBankResponseDTO> create(@RequestBody BloodBankRequestDTO dto) {
        return ResponseEntity.ok(bloodBankService.create(dto));
    }

    /**
     * Gets all blood banks.
     *
     * @return a list of blood bank response DTOs
     */
    @GetMapping
    public ResponseEntity<List<BloodBankResponseDTO>> getAll() {
        return ResponseEntity.ok(bloodBankService.findAll());
    }

    /**
     * Get an existing blood bank by ID.
     *
     * @param id the ID of the blood bank to retrieve
     * @return the blood bank response DTO
     */
    @GetMapping("/{id}")
    public ResponseEntity<BloodBankResponseDTO> getById(@PathVariable String id) {
        return ResponseEntity.ok(bloodBankService.findById(id));
    }

    /**
     * Retrieves all blood banks with geolocation (latitude and longitude)
     * to be displayed on the map.
     *
     * @return a list of blood banks with location data
     */
    @GetMapping("/locations")
    public ResponseEntity<List<BloodBankMapDTO>> getBloodBanksWithLocation() {
        return ResponseEntity.ok(bloodBankService.getAllWithLocation());
    }

    /**
     * Get the stats of a blood bank by ID.
     *
     * @param id the ID of the blood bank to retrieve the stats
     * @return the blood bank stats DTO
     */
    @GetMapping("/{id}/stats")
    public ResponseEntity<BloodBankStatsDTO> getStatsById(@PathVariable String id) {
        return ResponseEntity.ok(bloodBankService.findStatsById(id));
    }

    /**
     * Get the campaigns of a blood bank by ID.
     *
     * @param id the ID of the blood bank to retrieve the campaigns
     * @return the blood bank campaigns DTO
     */
    @GetMapping("/{id}/campaigns")
    public ResponseEntity<List<CampaignDTO>> getCampaignsById(@PathVariable String id) {
        return ResponseEntity.ok(bloodBankService.findCampaignsById(id));
    }

    @DeleteMapping("/{bloodBankId}/campaigns/{campaignId}")
    public ResponseEntity<Void> deleteCampaignById(
            @PathVariable String bloodBankId,
            @PathVariable String campaignId) {

        campaignService.deleteCampaign(bloodBankId, campaignId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/publish-dates")
    public ResponseEntity<Void> addAvailabilitySlots(@RequestBody BloodBankAvailabilityDTO slotsDTO) {
        bloodBankService.addAvailabilitySlots(slotsDTO);
        return ResponseEntity.ok().build();
    }
    /**
    @GetMapping("/available-slots")
    public ResponseEntity<List<BloodBank>> getBloodBanksWithAvailableSpots() {
        List<BloodBank> bloodBanks = bloodBankService.findBloodBanksWithAvailableSlots();
        return ResponseEntity.ok(bloodBanks);
    }
    **/
    @GetMapping("/available-bloodbanks")
    public ResponseEntity<List<BloodBankResponseDTO>> getBloodBanksWithNotNullDates() {
        List<BloodBankResponseDTO> bloodBanks = bloodBankService.findAllWithAvailableSlots();
        return ResponseEntity.ok(bloodBanks);
    }

    @GetMapping("/{bloodBankId}/available-slots/{date}")
    public ResponseEntity<AvailableSlotsDTO> getAvailableSlots(
            @PathVariable String bloodBankId,
            @PathVariable String date) {

        AvailableSlotsDTO slots = bloodBankService.getAvailableSlotsForDate(bloodBankId, date);
        return ResponseEntity.ok(slots);
    }

    @GetMapping("/{id}/availability")
    public ResponseEntity<Map<String, List<SlotDTO>>> getAvailability(@PathVariable String id) {
        BloodBank bank = bloodBankService.findEntityById(id);
        if (bank == null) return ResponseEntity.notFound().build();

        Map<String, List<SlotDTO>> result = new HashMap<>();
        for (DailyAvailability daily : bank.getAvailabilitySlots()) {
            for (Slot s: daily.getSlots()) {
                SlotDTO dto = new SlotDTO();
                dto.setTime(s.getTime());
                dto.setAvailableSpots(s.getAvailableSpots());

                result.computeIfAbsent(daily.getDate().toString(), k -> new ArrayList<>())
                        .add(dto);
            }
        }
        return ResponseEntity.ok(result);
    }

    @PostMapping("/schedule")
    public ResponseEntity<Void> scheduleDonation(@RequestBody DonationScheduleDTO scheduleDTO) {
        bloodBankService.scheduleDonation(scheduleDTO);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<BloodBankResponseDTO> updateBloodBank(
            @PathVariable String id,
            @RequestBody BloodBankRequestDTO dto) {
        return ResponseEntity.ok(bloodBankService.update(id, dto));
    }

    @GetMapping("/available-dates")
    public ResponseEntity<List<DailyAvailabilityDTO>> getAvailableDatesWithSlots(@RequestParam String bloodbankId) {
        List<DailyAvailabilityDTO> availableDates = bloodBankService.getAvailableDonationDatesWithSpots(bloodbankId);
        return ResponseEntity.ok(availableDates);
    }
}