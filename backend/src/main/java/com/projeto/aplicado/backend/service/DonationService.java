package com.projeto.aplicado.backend.service;

import com.bloodbank.model.Donation;
import com.bloodbank.model.Donation.DonationStatus;
import com.projeto.aplicado.backend.dto.donation.CreateDonationDTO;
import com.projeto.aplicado.backend.dto.donation.DonationDTO;
import com.projeto.aplicado.backend.dto.donation.DonationStatsDTO;
import com.projeto.aplicado.backend.dto.donation.SlotAvailabilityDTO;
import com.projeto.aplicado.backend.model.enums.BloodType;
import com.projeto.aplicado.backend.model.users.User;
import com.projeto.aplicado.backend.repository.DonationRepository;
import com.projeto.aplicado.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DonationService {

    private final DonationRepository donationRepository;
    private final UserRepository userRepository;
    private static final int MAX_SLOTS_PER_HOUR = 5;

    @Transactional
    public DonationDTO createDonation(String userId, CreateDonationDTO request) {
        // Buscar usuário e validar tipo sanguíneo
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        if (user.getBloodType() == null) {
            throw new RuntimeException("Tipo sanguíneo não cadastrado no perfil");
        }

        // Verificar se já existe agendamento ativo para este usuário neste dia
        List<DonationStatus> activeStatuses = Arrays.asList(
                DonationStatus.PENDING,
                DonationStatus.CONFIRMED
        );

        donationRepository.findByUserIdAndDateAndStatusIn(userId, request.getDate(), activeStatuses)
                .ifPresent(d -> {
                    throw new RuntimeException("Você já possui um agendamento para este dia");
                });

        // Verificar disponibilidade de slots
        SlotAvailabilityDTO availability = checkSlotAvailability(
                request.getBloodBankId(),
                request.getDate(),
                request.getHour()
        );

        if (!availability.isAvailable()) {
            throw new RuntimeException("Não há vagas disponíveis para este horário");
        }

        // Criar doação
        Donation donation = new Donation();
        donation.setUserId(userId);
        donation.setBloodBankId(request.getBloodBankId());
        donation.setDate(request.getDate());
        donation.setHour(request.getHour());
        donation.setSlot(request.getSlot());
        donation.setBloodType(user.getBloodType());
        donation.setStatus(DonationStatus.PENDING);
        donation.setCreatedAt(LocalDateTime.now());
        donation.setUpdatedAt(LocalDateTime.now());

        donation = donationRepository.save(donation);

        return mapToResponse(donation);
    }

    public List<DonationDTO> getUserDonations(String userId, boolean activeOnly) {
        List<Donation> donations;

        if (activeOnly) {
            List<DonationStatus> activeStatuses = Arrays.asList(
                    DonationStatus.PENDING,
                    DonationStatus.CONFIRMED
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
            // Se passou data, busca por data (TODOS os status)
            String datePrefix = date.substring(0, 10); // "YYYY-MM-DD"

            donations = donationRepository.findByBloodBankIdOrderByDateAscHourAsc(bloodBankId)
                    .stream()
                    .filter(d -> d.getDate().startsWith(datePrefix))
                    .collect(Collectors.toList());
        } else {
            // Sem data, retorna TODOS os agendamentos do banco
            donations = donationRepository.findByBloodBankIdOrderByDateAscHourAsc(bloodBankId);
        }

        return donations.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public SlotAvailabilityDTO checkSlotAvailability(
            String bloodBankId, String date, String hour) {

        List<DonationStatus> activeStatuses = Arrays.asList(
                DonationStatus.PENDING,
                DonationStatus.CONFIRMED
        );

        long slotsUsed = donationRepository.countByBloodBankIdAndDateAndHourAndStatusIn(
                bloodBankId, date, hour, activeStatuses);

        int slotsRemaining = MAX_SLOTS_PER_HOUR - (int) slotsUsed;
        boolean available = slotsRemaining > 0;

        return new SlotAvailabilityDTO(available, (int) slotsUsed, slotsRemaining);
    }

    @Transactional
    public DonationDTO cancelDonation(String donationId, String userId, String reason) {
        Donation donation = donationRepository.findByIdAndUserId(donationId, userId)
                .orElseThrow(() -> new RuntimeException("Agendamento não encontrado"));

        if (donation.getStatus() == DonationStatus.COMPLETED) {
            throw new RuntimeException("Não é possível cancelar um agendamento já completado");
        }

        donation.setStatus(DonationStatus.CANCELLED);
        donation.setCancellationReason(reason);
        donation.setUpdatedAt(LocalDateTime.now());

        donation = donationRepository.save(donation);

        return mapToResponse(donation);
    }

    @Transactional
    public DonationDTO confirmDonation(String donationId, String bloodBankId) {
        Donation donation = donationRepository.findByIdAndBloodBankId(donationId, bloodBankId)
                .orElseThrow(() -> new RuntimeException("Agendamento não encontrado"));

        donation.setStatus(DonationStatus.CONFIRMED);
        donation.setUpdatedAt(LocalDateTime.now());

        donation = donationRepository.save(donation);

        return mapToResponse(donation);
    }

    @Transactional
    public DonationDTO completeDonation(String donationId, String bloodBankId, String notes) {
        Donation donation = donationRepository.findByIdAndBloodBankId(donationId, bloodBankId)
                .orElseThrow(() -> new RuntimeException("Agendamento não encontrado"));

        donation.setStatus(DonationStatus.COMPLETED);
        if (notes != null && !notes.isEmpty()) {
            donation.setNotes(notes);
        }
        donation.setUpdatedAt(LocalDateTime.now());

        donation = donationRepository.save(donation);

        return mapToResponse(donation);
    }

    public List<DonationDTO> getUpcomingDonations(String bloodBankId, int days) {
        String today = LocalDateTime.now().toLocalDate().toString() + "T00:00:00.000Z";
        String futureDate = LocalDateTime.now().plusDays(days).toLocalDate().toString() + "T00:00:00.000Z";

        List<DonationStatus> activeStatuses = Arrays.asList(
                DonationStatus.PENDING,
                DonationStatus.CONFIRMED
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

    public DonationStatsDTO getStats(String bloodBankId, String startDate, String endDate) {
        // Buscar todas as doações no período
        List<Donation> donations = donationRepository.findAll().stream()
                .filter(d -> d.getBloodBankId().equals(bloodBankId))
                .filter(d -> d.getDate().compareTo(startDate) >= 0)
                .filter(d -> d.getDate().compareTo(endDate) <= 0)
                .toList();

        // Contar por status
        Map<String, Integer> byStatus = donations.stream()
                .collect(Collectors.groupingBy(
                        d -> d.getStatus().toString(),
                        Collectors.summingInt(e -> 1)
                ));

        // Contar por tipo sanguíneo (apenas completadas)
        Map<String, Integer> byBloodType = donations.stream()
                .filter(d -> d.getStatus() == DonationStatus.COMPLETED)
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

    private DonationDTO mapToResponse(Donation donation) {
        // Buscar informações do usuário e banco de sangue
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
