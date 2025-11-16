package com.projeto.aplicado.backend.controller;

import com.projeto.aplicado.backend.dto.donation.*;
import com.projeto.aplicado.backend.service.DonationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/api/donations")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class DonationController {

    private final DonationService donationService;

    /**
     * Create a new donation appointment.
     *
     * @param request the donation request containing bloodBankId, date, hour, and slot
     * @return the created donation response
     */
    @PostMapping
    public ResponseEntity<DonationDTO> createDonation(
            @Valid @RequestBody CreateDonationDTO request) {

        DonationDTO response = donationService.createDonation(
                request.getUserId(), request);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Get all donations for a specific user.
     *
     * @param userId the ID of the user
     * @param activeOnly if true, returns only pending and confirmed donations
     * @return list of user donations
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<DonationDTO>> getUserDonations(
            @PathVariable String userId,
            @RequestParam(defaultValue = "false") boolean activeOnly) {

        List<DonationDTO> donations = donationService.getUserDonations(userId, activeOnly);

        return ResponseEntity.ok(donations);
    }

    /**
     * Get all donations for a specific blood bank.
     *
     * @param bloodBankId the ID of the blood bank
     * @param date optional filter by specific date (ISO format)
     * @param status optional filter by status
     * @return list of blood bank donations
     */
    @GetMapping("/blood-bank/{bloodBankId}")
    public ResponseEntity<List<DonationDTO>> getBloodBankDonations(
            @PathVariable String bloodBankId,
            @RequestParam(required = false) String date,
            @RequestParam(required = false) String status) {

        List<DonationDTO> donations = donationService.getBloodBankDonations(
                bloodBankId, date, status);

        return ResponseEntity.ok(donations);
    }

    /**
     * Check slot availability for a specific time.
     *
     * @param bloodBankId the ID of the blood bank
     * @param date the date in ISO format
     * @param hour the hour in HH:MM format
     * @return slot availability information
     */
    @GetMapping("/check-availability")
    public ResponseEntity<SlotAvailabilityDTO> checkAvailability(
            @RequestParam String bloodBankId,
            @RequestParam String date,
            @RequestParam String hour) {

        SlotAvailabilityDTO availability = donationService.checkSlotAvailability(
                bloodBankId, date, hour);

        return ResponseEntity.ok(availability);
    }

    /**
     * Get a donation by ID.
     *
     * @param id the donation ID
     * @return the donation details
     */
    @GetMapping("/{id}")
    public ResponseEntity<DonationDTO> getDonationById(@PathVariable String id) {
        DonationDTO donation = donationService.getDonationById(id);
        return ResponseEntity.ok(donation);
    }

    /**
     * Cancel a donation appointment.
     *
     * @param id the donation ID
     * @param userId the user ID (owner of the donation)
     * @param request optional cancellation reason
     * @return the updated donation
     */
    @PatchMapping("/{id}/cancel")
    public ResponseEntity<DonationDTO> cancelDonation(
            @PathVariable String id,
            @RequestParam String userId,
            @RequestBody(required = false) CancelDonationDTO request) {

        String reason = request != null ? request.getReason() : null;
        DonationDTO response = donationService.cancelDonation(id, userId, reason);

        return ResponseEntity.ok(response);
    }

    /**
     * Confirm a donation appointment (blood bank action).
     *
     * @param id the donation ID
     * @param bloodBankId the blood bank ID
     * @return the updated donation
     */
    @PatchMapping("/{id}/confirm")
    public ResponseEntity<DonationDTO> confirmDonation(
            @PathVariable String id,
            @RequestParam String bloodBankId) {

        DonationDTO response = donationService.confirmDonation(id, bloodBankId);

        return ResponseEntity.ok(response);
    }

    /**
     * Mark a donation as completed (blood bank action).
     *
     * @param id the donation ID
     * @param bloodBankId the blood bank ID
     * @param request optional notes
     * @return the updated donation
     */
    @PatchMapping("/{id}/complete")
    public ResponseEntity<DonationDTO> completeDonation(
            @PathVariable String id,
            @RequestParam String bloodBankId,
            @RequestBody(required = false) CancelDonationDTO request) {

        String notes = request != null ? request.getReason() : null;
        DonationDTO response = donationService.completeDonation(id, bloodBankId, notes);

        return ResponseEntity.ok(response);
    }

    /**
     * Get upcoming donations for a blood bank.
     *
     * @param bloodBankId the blood bank ID
     * @param days number of days to look ahead (default 7)
     * @return list of upcoming donations
     */
    @GetMapping("/blood-bank/{bloodBankId}/upcoming")
    public ResponseEntity<List<DonationDTO>> getUpcomingDonations(
            @PathVariable String bloodBankId,
            @RequestParam(defaultValue = "7") int days) {

        List<DonationDTO> donations = donationService.getUpcomingDonations(bloodBankId, days);

        return ResponseEntity.ok(donations);
    }

    /**
     * Get donation statistics for a blood bank.
     *
     * @param bloodBankId the blood bank ID
     * @param startDate start date in ISO format
     * @param endDate end date in ISO format
     * @return donation statistics
     */
    @GetMapping("/blood-bank/{bloodBankId}/stats")
    public ResponseEntity<DonationStatsDTO> getStats(
            @PathVariable String bloodBankId,
            @RequestParam String startDate,
            @RequestParam String endDate) {

        DonationStatsDTO stats = donationService.getStats(bloodBankId, startDate, endDate);

        return ResponseEntity.ok(stats);
    }
}