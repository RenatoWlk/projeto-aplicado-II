package com.projeto.aplicado.backend.service;

import com.projeto.aplicado.backend.dto.donation.*;
import com.projeto.aplicado.backend.model.DailyAvailability;
import com.projeto.aplicado.backend.model.Donation;
import com.projeto.aplicado.backend.model.Slot;
import com.projeto.aplicado.backend.model.UserNotification;
import com.projeto.aplicado.backend.model.users.BloodBank;
import com.projeto.aplicado.backend.model.users.User;
import com.projeto.aplicado.backend.repository.BloodBankRepository;
import com.projeto.aplicado.backend.repository.DonationRepository;
import com.projeto.aplicado.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DonationService {

    private final DonationRepository donationRepository;
    private final UserRepository userRepository;
    private final BloodBankRepository bloodBankRepository;
    private final AchievementService achievementService;

    @Transactional
    public DonationDTO createDonation(String userId, CreateDonationDTO request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        if (user.getBloodType() == null) {
            throw new RuntimeException("Tipo sanguíneo não cadastrado no perfil");
        }

        List<Donation.DonationStatus> activeStatuses = Arrays.asList(
                Donation.DonationStatus.PENDING,
                Donation.DonationStatus.CONFIRMED
        );

        donationRepository.findByUserIdAndDateAndStatusIn(userId, request.getDate(), activeStatuses)
                .ifPresent(d -> {
                    throw new RuntimeException("Você já possui um agendamento para este dia");
                });

        LocalDate date = LocalDate.parse(request.getDate().substring(0, 10));
        LocalTime time = LocalTime.parse(request.getHour());
        bookSlot(request.getBloodBankId(), date, time);

        Donation donation = new Donation();
        donation.setUserId(userId);
        donation.setBloodBankId(request.getBloodBankId());
        donation.setDate(request.getDate());
        donation.setHour(request.getHour());
        donation.setSlot(request.getSlot());
        donation.setBloodType(user.getBloodType());
        donation.setStatus(Donation.DonationStatus.PENDING);
        donation.setCreatedAt(LocalDateTime.now());
        donation.setUpdatedAt(LocalDateTime.now());

        donation = donationRepository.save(donation);

        return mapToResponse(donation);
    }

    public List<DonationDTO> getUserDonations(String userId, boolean activeOnly) {
        List<Donation> donations;

        if (activeOnly) {
            List<Donation.DonationStatus> activeStatuses = Arrays.asList(
                    Donation.DonationStatus.PENDING,
                    Donation.DonationStatus.CONFIRMED
            );
            donations = donationRepository.findByUserIdAndStatusInOrderByDateDescHourDesc(
                    userId, activeStatuses);
        } else {
            donations = donationRepository.findByUserIdOrderByDateDescHourDesc(userId);
        }

        return donations.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<DonationDTO> getBloodBankDonations(String bloodBankId, String date, String status) {
        List<Donation> donations;

        if (date != null && !date.isEmpty()) {
            String datePrefix = date.substring(0, 10); // "YYYY-MM-DD"

            donations = donationRepository.findByBloodBankIdOrderByDateAscHourAsc(bloodBankId)
                    .stream()
                    .filter(d -> d.getDate().startsWith(datePrefix))
                    .collect(Collectors.toList());
        } else {
            donations = donationRepository.findByBloodBankIdOrderByDateAscHourAsc(bloodBankId);
        }

        return donations.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public SlotAvailabilityDTO checkSlotAvailability(
            String bloodBankId, String date, String hour, int totalSlotsPublished) {

        List<Donation.DonationStatus> activeStatuses = Arrays.asList(
                Donation.DonationStatus.PENDING,
                Donation.DonationStatus.CONFIRMED
        );

        long slotsUsed = donationRepository.countByBloodBankIdAndDateAndHourAndStatusIn(
                bloodBankId, date, hour, activeStatuses);

        int slotsRemaining = totalSlotsPublished - (int) slotsUsed;
        boolean available = slotsRemaining > 0;

        return new SlotAvailabilityDTO(available, (int) slotsUsed, slotsRemaining);
    }

    @Transactional
    public DonationDTO cancelDonation(String donationId, String userId, String reason) {
        Donation donation = donationRepository.findByIdAndUserId(donationId, userId)
                .orElseThrow(() -> new RuntimeException("Agendamento não encontrado"));

        if (donation.getStatus() == Donation.DonationStatus.COMPLETED) {
            throw new RuntimeException("Não é possível cancelar um agendamento já completado");
        }

        LocalDate date = LocalDate.parse(donation.getDate().substring(0, 10));
        LocalTime time = LocalTime.parse(donation.getHour());
        releaseSlot(donation.getBloodBankId(), date, time);

        donation.setStatus(Donation.DonationStatus.CANCELLED);
        donation.setCancellationReason(reason);
        donation.setUpdatedAt(LocalDateTime.now());

        donation = donationRepository.save(donation);

        User user = userRepository.findUserById(donation.getUserId()).orElseThrow();
        Instant now = Instant.now();
        UserNotification un = new UserNotification("donation_cancel", false, now, now.plus(72, ChronoUnit.HOURS));
        user.getActiveNotifications().add(un);
        userRepository.save(user);

        return mapToResponse(donation);
    }

    @Transactional
    public DonationDTO confirmDonation(String donationId, String bloodBankId) {
        Donation donation = donationRepository.findByIdAndBloodBankId(donationId, bloodBankId)
                .orElseThrow(() -> new RuntimeException("Agendamento não encontrado"));

        donation.setStatus(Donation.DonationStatus.CONFIRMED);
        donation.setUpdatedAt(LocalDateTime.now());

        donation = donationRepository.save(donation);

        User user = userRepository.findUserById(donation.getUserId()).orElseThrow();
        Instant now = Instant.now();
        UserNotification un = new UserNotification("donation_confirm", false, now, now.plus(72, ChronoUnit.HOURS));
        user.getActiveNotifications().add(un);
        userRepository.save(user);

        return mapToResponse(donation);
    }

    @Transactional
    public DonationDTO completeDonation(String donationId, String bloodBankId, String notes) {
        Donation donation = donationRepository.findByIdAndBloodBankId(donationId, bloodBankId)
                .orElseThrow(() -> new RuntimeException("Agendamento não encontrado"));

        donation.setStatus(Donation.DonationStatus.COMPLETED);
        if (notes != null && !notes.isEmpty()) {
            donation.setNotes(notes);
        }
        donation.setUpdatedAt(LocalDateTime.now());

        donation = donationRepository.save(donation);

        User user = userRepository.findUserById(donation.getUserId()).orElseThrow();
        user.setTimesDonated(user.getTimesDonated() + 1);
        user.setTotalPoints(user.getTotalPoints() + 100);
        Instant now = Instant.now();
        UserNotification un = new UserNotification("donation_complete", false, now, now.plus(72, ChronoUnit.HOURS));
        user.getActiveNotifications().add(un);
        userRepository.save(user);
        achievementService.validateAndUnlockAchievements(user);

        return mapToResponse(donation);
    }

    public List<DonationDTO> getUpcomingDonations(String bloodBankId, int days) {
        String today = LocalDateTime.now().toLocalDate().toString() + "T00:00:00.000Z";
        String futureDate = LocalDateTime.now().plusDays(days).toLocalDate().toString() + "T00:00:00.000Z";

        List<Donation.DonationStatus> activeStatuses = Arrays.asList(
                Donation.DonationStatus.PENDING,
                Donation.DonationStatus.CONFIRMED
        );

        List<Donation> donations = donationRepository.findUpcomingDonations(
                bloodBankId, today, futureDate, activeStatuses);

        return donations.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public DonationDTO getDonationById(String id) {
        Donation donation = donationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Agendamento não encontrado"));

        return mapToResponse(donation);
    }

    public DonationStatsDTO getStats(String bloodBankId) {
        List<Donation> donations = donationRepository.findAll().stream()
                .filter(d -> d.getBloodBankId().equals(bloodBankId))
                .toList();

        Map<String, Integer> byStatus = donations.stream()
                .collect(Collectors.groupingBy(
                        d -> d.getStatus().toString(),
                        Collectors.summingInt(e -> 1)
                ));

        Map<String, Integer> byBloodType = donations.stream()
                .filter(d -> d.getStatus() == Donation.DonationStatus.COMPLETED)
                .filter(d -> d.getBloodType() != null)
                .collect(Collectors.groupingBy(
                        d -> d.getBloodType().getLabel(),
                        Collectors.summingInt(e -> 1)
                ));

        int total = donations.size();
        int completed = byStatus.getOrDefault("COMPLETED", 0);
        int pending = byStatus.getOrDefault("PENDING", 0);
        int cancelled = byStatus.getOrDefault("CANCELLED", 0);

        return new DonationStatsDTO(byStatus, byBloodType, total, completed, pending, cancelled);
    }

    @Transactional
    protected void bookSlot(String bloodBankId, LocalDate date, LocalTime time) {
        BloodBank bloodBank = bloodBankRepository.findBloodBankById(bloodBankId)
                .orElseThrow(() -> new RuntimeException("Banco de sangue não encontrado"));

        Optional<DailyAvailability> dailyAvailability = bloodBank.getAvailabilitySlots().stream()
                .filter(da -> da.getDate().equals(date))
                .findFirst();

        if (dailyAvailability.isEmpty()) {
            throw new RuntimeException("Data não disponível para agendamento");
        }

        Optional<Slot> slot = dailyAvailability.get().getSlots().stream()
                .filter(s -> s.getTime().equals(time))
                .findFirst();

        if (slot.isEmpty()) {
            throw new RuntimeException("Horário não disponível");
        }

        Slot targetSlot = slot.get();

        if (targetSlot.getTotalSpots() == null) {
            targetSlot.setTotalSpots(targetSlot.getAvailableSpots());
        }
        if (targetSlot.getBookedSpots() == null) {
            targetSlot.setBookedSpots(0);
        }

        if (targetSlot.getAvailableSpots() <= 0) {
            throw new RuntimeException("Não há vagas disponíveis para este horário");
        }

        targetSlot.setBookedSpots(targetSlot.getBookedSpots() + 1);
        targetSlot.setAvailableSpots(targetSlot.getAvailableSpots() - 1);

        bloodBankRepository.save(bloodBank);
    }

    @Transactional
    protected void releaseSlot(String bloodBankId, LocalDate date, LocalTime time) {
        BloodBank bloodBank = bloodBankRepository.findBloodBankById(bloodBankId)
                .orElseThrow(() -> new RuntimeException("Banco de sangue não encontrado"));

        Optional<DailyAvailability> dailyAvailability = bloodBank.getAvailabilitySlots().stream()
                .filter(da -> da.getDate().equals(date))
                .findFirst();

        if (dailyAvailability.isEmpty()) {
            return;
        }

        Optional<Slot> slot = dailyAvailability.get().getSlots().stream()
                .filter(s -> s.getTime().equals(time))
                .findFirst();

        if (slot.isEmpty()) {
            return;
        }

        Slot targetSlot = slot.get();

        if (targetSlot.getTotalSpots() == null) {
            targetSlot.setTotalSpots(targetSlot.getAvailableSpots());
        }
        if (targetSlot.getBookedSpots() == null) {
            targetSlot.setBookedSpots(0);
        }

        if (targetSlot.getBookedSpots() > 0) {
            targetSlot.setBookedSpots(targetSlot.getBookedSpots() - 1);
        }
        if (targetSlot.getAvailableSpots() < targetSlot.getTotalSpots()) {
            targetSlot.setAvailableSpots(targetSlot.getAvailableSpots() + 1);
        }

        bloodBankRepository.save(bloodBank);
    }
    private DonationDTO mapToResponse(Donation donation) {
        User user = userRepository.findById(donation.getUserId()).orElse(null);
        User bloodBank = userRepository.findById(donation.getBloodBankId()).orElse(null);

        return new DonationDTO(
                donation.getId(),
                donation.getUserId(),
                user != null ? user.getName() : null,
                user != null ? user.getPhone() : null,
                user != null ? user.getEmail() : null,
                donation.getBloodBankId(),
                bloodBank != null ? bloodBank.getName() : null,
                bloodBank != null ? String.valueOf(bloodBank.getAddress()) : null,
                donation.getDate(),
                donation.getHour(),
                donation.getSlot(),
                donation.getBloodType(),
                donation.getStatus(),
                donation.getNotes(),
                donation.getCancellationReason(),
                donation.getCreatedAt(),
                donation.getUpdatedAt()
        );
    }
}