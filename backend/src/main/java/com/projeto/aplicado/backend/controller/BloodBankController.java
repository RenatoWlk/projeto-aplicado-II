package com.projeto.aplicado.backend.controller;

import com.projeto.aplicado.backend.dto.CampaignDTO;
import com.projeto.aplicado.backend.dto.DonationScheduleDTO;
import com.projeto.aplicado.backend.dto.bloodbank.*;
import com.projeto.aplicado.backend.model.BloodBankAvailability;
import com.projeto.aplicado.backend.model.DailyAvailability;
import com.projeto.aplicado.backend.model.Slot;
import com.projeto.aplicado.backend.model.users.BloodBank;
import com.projeto.aplicado.backend.service.BloodBankService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
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
        System.out.println(slotsDTO);
        return ResponseEntity.ok().build();
    }
    @GetMapping("/available-slots")
    public ResponseEntity<List<BloodBank>> getBloodBanksWithAvailableSpots() {
        List<BloodBank> bloodBanks = bloodBankService.findBloodBanksWithAvailableSlots();
        return ResponseEntity.ok(bloodBanks);
    }

    @GetMapping("/available-dates")
    public List<Map<String, Object>> getBloodbankAvailableDates(@RequestParam String bloodbankId) {
        BloodBank bank = bloodBankService.findEntityById(bloodbankId);
        //List<BloodBank> banks = bloodBankService.findAvailableDates();
        List<Map<String, Object>> slots = new ArrayList<>();

        if (bank != null) {
            for (DailyAvailability slot: bank.getAvailabilitySlots()) {
                Map<String, Object> map = new HashMap<>();
                map.put("date", slot.getDate());
                slots.add(map);
                System.out.println(map);
            }
        }
        return slots;
    }

    @GetMapping("/available-hours")
    public List<Map<String, Object>> getBloodbankAvailableHours(
            @RequestParam("bloodbankId") String bloodbankId,
            @RequestParam("date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        BloodBank bank = bloodBankService.findEntityById(bloodbankId);
        List<Map<String, Object>> slots = new ArrayList<>();

        if (bank != null) {
            for (DailyAvailability daily: bank.getAvailabilitySlots()) {
                if (daily.getDate().isEqual(date)) {
                    for (Slot s: daily.getSlots()) {
                        Map<String, Object> map = new HashMap<>();
                        map.put("time", s.getTime());
                        map.put("availableSpots", s.getAvailableSpots());
                        slots.add(map);
                    }
                }
            }
        }
        return slots;
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
}
