package com.projeto.aplicado.backend.controller;

import com.projeto.aplicado.backend.dto.CampaignDTO;
import com.projeto.aplicado.backend.dto.DonationScheduleDTO;
import com.projeto.aplicado.backend.dto.bloodbank.BloodBankMapDTO;
import com.projeto.aplicado.backend.dto.bloodbank.BloodBankRequestDTO;
import com.projeto.aplicado.backend.dto.bloodbank.BloodBankResponseDTO;
import com.projeto.aplicado.backend.dto.bloodbank.BloodBankStatsDTO;
import com.projeto.aplicado.backend.dto.bloodbank.BloodBankAvailabilityDTO;
import com.projeto.aplicado.backend.model.AvailabilitySlot;
import com.projeto.aplicado.backend.model.users.BloodBank;
import com.projeto.aplicado.backend.service.BloodBankService;
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

    @PostMapping("/availability")
    public ResponseEntity<Void> addAvailabilitySlots(@RequestBody BloodBankAvailabilityDTO slotsDTO) {
        bloodBankService.addAvailabilitySlots(slotsDTO);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/available-slots")
    public ResponseEntity<List<BloodBank>> getBloodBanksWithAvailableSpots() {
        List<BloodBank> bloodBanks = bloodBankService.findBloodBanksWithAvailableSlots();
        return ResponseEntity.ok(bloodBanks);
    }

    @GetMapping("/available-dates")
    public List<Map<String, Object>> getBloodAvailableDates(@RequestParam("bloodBankId") String bloodBankId) {
        BloodBank bank = bloodBankService.findEntityById(bloodBankId);
        //List<BloodBank> banks = bloodBankService.findAvailableDates();
        List<Map<String, Object>> slots = new ArrayList<>();

        if (bank != null) {
            for (AvailabilitySlot slot: bank.getAvailabilitySlots()) {
                Map<String, Object> map = new HashMap<>();
                map.put("startDate", slot.getStartDate());
                map.put("endDate", slot.getEndDate());
                slots.add(map);
            }
        }
        return slots;
    }

    @GetMapping("/available-hours")
    public List<Map<String, Object>> getBloodAvailableHours() {
        List<BloodBank> banks = bloodBankService.findAvailableHours();
        List<Map<String, Object>> slots = new ArrayList<>();

        for (BloodBank bank : banks) {
            for (AvailabilitySlot slot: bank.getAvailabilitySlots()) {
                Map<String, Object> map = new HashMap<>();
                map.put("startTime", slot.getStartTime());
                map.put("endTime", slot.getEndTime());
                slots.add(map);
            }
        }
        return slots;
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
}
