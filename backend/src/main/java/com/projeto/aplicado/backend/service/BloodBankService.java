package com.projeto.aplicado.backend.service;

import com.projeto.aplicado.backend.constants.Messages;
import com.projeto.aplicado.backend.dto.CampaignDTO;
import com.projeto.aplicado.backend.dto.DonationScheduleDTO;
import com.projeto.aplicado.backend.dto.bloodbank.*;
import com.projeto.aplicado.backend.dto.donation.AvailableSlotsDTO;
import com.projeto.aplicado.backend.dto.donation.DailyAvailabilityDTO;
import com.projeto.aplicado.backend.dto.donation.SlotDTO;
import com.projeto.aplicado.backend.exception.UserNotFoundException;
import com.projeto.aplicado.backend.model.*;
import com.projeto.aplicado.backend.model.enums.BloodType;
import com.projeto.aplicado.backend.model.enums.Role;
import com.projeto.aplicado.backend.model.users.BloodBank;
import com.projeto.aplicado.backend.model.Donation;
import com.projeto.aplicado.backend.model.users.User;
import com.projeto.aplicado.backend.repository.BloodBankRepository;
import com.projeto.aplicado.backend.repository.DonationRepository;
import com.projeto.aplicado.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.Normalizer;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BloodBankService {
    private final BloodBankRepository bloodBankRepository;
    private final UserRepository userRepository;
    private final GeolocationService geolocationService;
    private final PasswordEncoder passwordEncoder;
    private final DonationRepository donationRepository;
    private final AchievementService achievementService;

    /**
     * Creates a new blood bank with default values and saves it to the database.
     *
     * @param dto the blood bank request data
     * @return a DTO with the created blood bank information
     */
    public BloodBankResponseDTO create(BloodBankRequestDTO dto) {
        BloodBank bloodBank = new BloodBank();
        bloodBank.setName(dto.getName());
        bloodBank.setEmail(dto.getEmail());
        bloodBank.setPassword(passwordEncoder.encode(dto.getPassword()));
        bloodBank.setAddress(dto.getAddress());
        bloodBank.setPhone(dto.getPhone());
        bloodBank.setRegistrationDate(LocalDate.now());
        bloodBank.setRole(Role.BLOODBANK);
        bloodBank.setCnpj(dto.getCnpj());
        bloodBank.setCampaigns(new ArrayList<>());
        bloodBank.setTotalDonations(0);
        bloodBank.setScheduledDonations(0);

        // Initialize all blood types with zero blood bags
        Map<BloodType, Integer> initialBags = new EnumMap<>(BloodType.class);
        Arrays.stream(BloodType.values()).forEach(type -> initialBags.put(type, 0));
        bloodBank.setBloodTypeBloodBags(initialBags);

        // Start with an empty donation history
        bloodBank.setDonationsOverTime(new ArrayList<>());

        bloodBank = bloodBankRepository.save(bloodBank);
        return toResponseDTO(bloodBank);
    }

    /**
     * Retrieves all blood banks from the database.
     *
     * @return a list of blood bank response DTOs
     */
    public List<BloodBankResponseDTO> findAll() {
        return bloodBankRepository.findAllBloodBanks().stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    /**
     * Finds a blood bank by its ID.
     *
     * @param id the ID of the blood bank
     * @return the blood bank as a response DTO
     * @throws RuntimeException if no blood bank is found with the given ID
     */
    public BloodBankResponseDTO findById(String id) {
        return bloodBankRepository.findBloodBankById(id)
                .map(this::toResponseDTO)
                .orElseThrow(() -> new RuntimeException(Messages.USER_NOT_FOUND));
    }

    /**
     * Retrieves statistical data for a specific blood bank.
     *
     * @param id the ID of the blood bank
     * @return a DTO containing blood donation statistics
     */
    public BloodBankStatsDTO findStatsById(String id) {
        return bloodBankRepository.findBloodBankById(id)
                .map(this::toStatsDTO)
                .orElseThrow(() -> new RuntimeException(Messages.USER_NOT_FOUND));
    }

    /**
     * Retrieves all the campaigns for a specific blood bank.
     *
     * @param id the ID of the blood bank
     * @return a list containing all the campaigns from the blood bank
     */
    public List<CampaignDTO> findCampaignsById(String id) {
        return bloodBankRepository.findBloodBankById(id)
                .map(this::toCampaignsDTO)
                .orElseThrow(() -> new RuntimeException(Messages.USER_NOT_FOUND));
    }

    /**
     * Retrieves all blood banks and attempts to enrich each one with geolocation data. <br>
     * If the address is incomplete or an error occurs, coordinates are set to 0.
     *
     * @return a list of blood bank DTOs including location information
     */
    public List<BloodBankMapDTO> getAllWithLocation() {
        return bloodBankRepository.findAllBloodBanks().stream().map(bloodBank -> {
            BloodBankMapDTO dto = toMapDTO(bloodBank);

            if (bloodBank.getAddress() == null ||
                    bloodBank.getAddress().getStreet() == null ||
                    bloodBank.getAddress().getCity() == null ||
                    bloodBank.getAddress().getState() == null ||
                    bloodBank.getAddress().getZipCode() == null) {
                return dto;
            }

            try {
                String address = removeAccents(bloodBank.getAddress().getStreet().toLowerCase());

                double[] coordinates = geolocationService.getCoordinatesFromAddress(address);
                dto.setLatitude(coordinates[0]);
                dto.setLongitude(coordinates[1]);
            } catch (Exception e) {
                System.err.println("Error trying to get the coords");
                System.err.println("Error message: " + e.getMessage());
                dto.setLatitude(0.0);
                dto.setLongitude(0.0);
            }

            return dto;
        }).collect(Collectors.toList());
    }

    /**
     * Retrieves the nearby blood banks based on the user geolocation.
     *
     * @param userId the user ID to calculate the distance of the blood banks from
     * @return a list of blood bank DTOs including location information
     */
    public List<BloodBankNearbyDTO> getNearbyBloodbanksFromUser(String userId) {
        User user = userRepository.findUserById(userId)
                .orElseThrow(() -> new RuntimeException(Messages.USER_NOT_FOUND));

        if (user.getAddress() == null ||
                user.getAddress().getStreet() == null ||
                user.getAddress().getCity() == null ||
                user.getAddress().getState() == null ||
                user.getAddress().getZipCode() == null) {
            throw new RuntimeException(Messages.USER_ADDRESS_INCOMPLETE);
        }

        String userAddress = removeAccents(user.getAddress().getStreet().toLowerCase());
        double[] userCoordinates = geolocationService.getCoordinatesFromAddress(userAddress);
        double userLat = userCoordinates[0];
        double userLon = userCoordinates[1];

        final double MAX_DISTANCE_KM = 80.0;

        return bloodBankRepository.findAllBloodBanks().stream().map(bloodBank -> {
            BloodBankNearbyDTO dto = toNearbyDTO(bloodBank);

            try {
                if (bloodBank.getAddress() != null) {
                    String fullAddress = removeAccents(bloodBank.getAddress().getStreet().toLowerCase());

                    double[] coordinates = geolocationService.getCoordinatesFromAddress(fullAddress);

                    if (coordinates[0] != 0.0) {
                        double bankLat = coordinates[0];
                        double bankLon = coordinates[1];

                        double distance = calculateDistance(userLat, userLon, bankLat, bankLon);

                        if (distance <= MAX_DISTANCE_KM) {
                            dto.setDistance(distance);
                            return dto;
                        }
                    }
                }
            } catch (Exception e) {
                System.err.println("\n\n\n\nError trying to get the coords");
                System.err.println("Error message: " + e.getMessage());
            }

            return null;
        }).filter(Objects::nonNull).collect(Collectors.toList());
    }

    /**
     * Calculates the distance between two geographic coordinates using the Haversine formula.
     *
     * @param lat1 latitude of the first point
     * @param lon1 longitude of the first point
     * @param lat2 latitude of the second point
     * @param lon2 longitude of the second point
     * @return the distance in kilometers
     */
    private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        final int EARTH_RADIUS_KM = 6371;

        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);

        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                        Math.sin(dLon / 2) * Math.sin(dLon / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return EARTH_RADIUS_KM * c;
    }

    public String removeAccents(String input) {
        String normalized = Normalizer.normalize(input, Normalizer.Form.NFD);
        return normalized.replaceAll("\\p{InCombiningDiacriticalMarks}+", "");
    }

    /**
     * Converts a BloodBank entity to its corresponding response DTO.
     *
     * @param bloodBank the blood bank entity
     * @return the response DTO
     */
    private BloodBankResponseDTO toResponseDTO(BloodBank bloodBank) {
        BloodBankResponseDTO dto = new BloodBankResponseDTO();
        dto.setId(bloodBank.getId());
        dto.setName(bloodBank.getName());
        dto.setEmail(bloodBank.getEmail());
        dto.setAddress(bloodBank.getAddress());
        dto.setPhone(bloodBank.getPhone());
        dto.setRole(bloodBank.getRole());
        dto.setCnpj(bloodBank.getCnpj());
        dto.setCampaigns(bloodBank.getCampaigns());
        return dto;
    }

    /**
     * Converts a BloodBank entity to a map-specific DTO (with geolocation info).
     *
     * @param bloodBank the blood bank entity
     * @return the map DTO
     */
    private BloodBankMapDTO toMapDTO(BloodBank bloodBank) {
        BloodBankMapDTO dto = new BloodBankMapDTO();
        dto.setName(bloodBank.getName());
        dto.setAddress(bloodBank.getAddress());
        dto.setPhone(bloodBank.getPhone());
        return dto;
    }

    /**
     * Converts a BloodBank entity to a DTO containing statistical data.
     *
     * @param bloodBank the blood bank entity
     * @return the statistics DTO
     */
    private BloodBankStatsDTO toStatsDTO(BloodBank bloodBank) {
        BloodBankStatsDTO dto = new BloodBankStatsDTO();
        dto.setTotalDonations(bloodBank.getTotalDonations());
        dto.setDonationsOverTime(bloodBank.getDonationsOverTime());
        dto.setBloodTypeBloodBags(bloodBank.getBloodTypeBloodBags());
        dto.setScheduledDonations(bloodBank.getScheduledDonations());
        return dto;
    }

    /**
     * Converts a BloodBank entity to a DTO containing all the campaigns.
     *
     * @param bloodBank the blood bank entity
     * @return the list of campaigns DTOs
     */
    private List<CampaignDTO> toCampaignsDTO(BloodBank bloodBank) {
        List<CampaignDTO> dtoList = new ArrayList<>();

        for (Campaign campaign : bloodBank.getCampaigns()) {
            CampaignDTO dto = new CampaignDTO();
            dto.setTitle(campaign.getTitle());
            dto.setBody(campaign.getBody());
            dto.setStartDate(campaign.getStartDate());
            dto.setEndDate(campaign.getEndDate());
            dto.setPhone(campaign.getPhone());
            dto.setLocation(campaign.getLocation());
            dtoList.add(dto);
        }

        return dtoList;
    }

    /**
     * Converts a BloodBank entity to a DTO with distance field.
     *
     * @param bloodBank the blood bank entity
     * @return the nearby DTO
     */
    private BloodBankNearbyDTO toNearbyDTO(BloodBank bloodBank) {
        BloodBankNearbyDTO dto = new BloodBankNearbyDTO();
        dto.setName(bloodBank.getName());
        dto.setAddress(bloodBank.getAddress());
        dto.setPhone(bloodBank.getPhone());
        return dto;
    }

    /**
     * Adds an availability slot to a blood bank.
     *
     * @param dto the DTO with the availability slot data
     * @throws RuntimeException if the blood bank is not found
     */
    public void addAvailabilitySlots(BloodBankAvailabilityDTO dto) {
        BloodBank bloodBank = bloodBankRepository.findBloodBankById(dto.getId())
                .orElseThrow(() -> new RuntimeException("Banco de sangue não encontrado"));

        if (bloodBank.getAvailabilitySlots() == null) {
            bloodBank.setAvailabilitySlots(new ArrayList<>());
        }

        for (DailyAvailabilityDTO dailyDto: dto.getAvailability()) {
            LocalDate date = dailyDto.getDate();

            List<Slot> slots = dailyDto.getSlots().stream().map(s -> new Slot(s.getTime(), s.getAvailableSpots())).toList();
            DailyAvailability daily = new DailyAvailability(date, slots);
            bloodBank.getAvailabilitySlots().add(daily);
        }
        bloodBankRepository.save(bloodBank);
    }


    /**
     * Schedules a donation appointment for a user at a blood bank.
     *
     * @param dto the donation scheduling request DTO
     * @throws RuntimeException if user or blood bank is not found
     */
    @Transactional
    public void scheduleDonation(DonationScheduleDTO dto) {
        User user = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new UserNotFoundException(Role.USER, "Usuário não encontrado"));

        BloodBank bloodBank = bloodBankRepository.findBloodBankById(dto.getBloodBankId())
                .orElseThrow(() -> new UserNotFoundException(Role.BLOODBANK, "Banco de sangue não encontrado"));

        if (user.getScheduledDonations() == null) {
            user.setScheduledDonations(new ArrayList<>());
        }

        boolean alreadyScheduled = user.getScheduledDonations().stream()
                .anyMatch(d -> d.getDate().equals(dto.getDate()) && d.getHour().equals(dto.getHour()));
        if (alreadyScheduled) {
            throw new RuntimeException("Usuário já possui agendamento nesse horário.");
        }

        ScheduledDonation scheduledDonation = new ScheduledDonation();
        scheduledDonation.setBloodBankId(bloodBank.getId());
        scheduledDonation.setDate(dto.getDate());
        scheduledDonation.setHour(dto.getHour());
        scheduledDonation.setSlot(dto.getSlot());

        user.getScheduledDonations().add(scheduledDonation);
        user.setLastDonationDate(dto.getDate());
        userRepository.save(user);

        int current = bloodBank.getScheduledDonations() != null ? bloodBank.getScheduledDonations() : 0;
        bloodBank.setScheduledDonations(current + 1);
        bloodBankRepository.save(bloodBank);

        BloodBank availability = bloodBankRepository.findBloodBankById(dto.getBloodBankId())
                .orElseThrow(() -> new RuntimeException("Disponibilidade de banco nao encontrada"));

        DailyAvailability daily = availability.getAvailabilitySlots().stream()
                .filter(d -> d.getDate().equals(dto.getDate()))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Data não encontrada na disponiblidade"));

        LocalTime time = LocalTime.parse(dto.getHour());
        Slot slot = daily.getSlots().stream()
                .filter(s -> s.getTime().equals(time))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Sem vagas disponíveis para esse horário."));

        if (slot.getAvailableSpots() <= 0) {
            throw new RuntimeException("Sem vagas disponíveis para esse horário");
        }

        slot.setAvailableSpots(slot.getAvailableSpots() - 1);
        bloodBankRepository.save(availability);

        achievementService.validateAndUnlockAchievements(user);
    }

    /**
     * Finds all blood banks with availability slots.
     *
     * @return list of blood banks with available slots
     */
    /*(
    public List<BloodBank> findBloodBanksWithAvailableSlots() {
        return bloodBankRepository.findByAvailabilitySlotsNotNull();
    }
    **/

    /**
     * Finds all blood banks with available dates only.
     *
     * @return list of blood banks with available dates
     */
    public List<BloodBank> findAvailableDates() {
        return bloodBankRepository.findAvailableDatesOnly();
    }

    /**
     * Finds all blood banks with available hours only.
     *
     * @return list of blood banks with available time slots
     */
    public List<BloodBank> findAvailableHours() {
        return bloodBankRepository.findAvailableHoursOnly();
    }

    public BloodBank findEntityById(String id) {
        return bloodBankRepository.findById(id).orElse(null);
    }

    /**
     * Updates an existing blood bank's information.
     *
     * @param id  the ID of the blood bank to update
     * @param dto the DTO containing the updated information
     * @return the updated blood bank response DTO
     */
    public BloodBankResponseDTO update(String id, BloodBankRequestDTO dto) {
        BloodBank bloodBank = bloodBankRepository.findBloodBankById(id)
                .orElseThrow(() -> new RuntimeException(Messages.USER_NOT_FOUND));

        bloodBank.setName(dto.getName());
        bloodBank.setEmail(dto.getEmail());
        bloodBank.setAddress(dto.getAddress());
        bloodBank.setPhone(dto.getPhone());
        bloodBank.setCnpj(dto.getCnpj());

        bloodBank = bloodBankRepository.save(bloodBank);
        return toResponseDTO(bloodBank);
    }

    public List<DailyAvailabilityDTO> getAvailableDonationDatesWithSpots(String bloodbankId) {
        BloodBank bloodBank = bloodBankRepository.findBloodBankById(bloodbankId)
                .orElseThrow(() -> new RuntimeException("Banco de sangue não encontrado"));

        if (bloodBank.getAvailabilitySlots() == null || bloodBank.getAvailabilitySlots().isEmpty()) {
            return new ArrayList<>();
        }

        return bloodBank.getAvailabilitySlots().stream()
                .map(dailyAvailability -> {
                    DailyAvailabilityDTO dto = new DailyAvailabilityDTO();
                    dto.setDate(dailyAvailability.getDate());

                    List<SlotDTO> slotDTOs = dailyAvailability.getSlots().stream()
                            .map(slot -> {
                                SlotDTO slotDTO = new SlotDTO();
                                slotDTO.setTime(slot.getTime());
                                slotDTO.setAvailableSpots(slot.getAvailableSpots());
                                return slotDTO;
                            })
                            .collect(Collectors.toList());

                    dto.setSlots(slotDTOs);
                    return dto;
                })
                .collect(Collectors.toList());
    }

    public AvailableSlotsDTO getAvailableSlotsForDate(String bloodBankId, String dateStr) {
        String datePrefix = dateStr.substring(0, 10);
        LocalDate targetDate = LocalDate.parse(datePrefix);

        // 1. Buscar banco de sangue
        BloodBank bloodBank = bloodBankRepository.findById(bloodBankId)
                .orElseThrow(() -> new RuntimeException("Banco de sangue nao encontrado"));

        // 2. Buscar slots publicados
        List<DailyAvailability> availabilityList = bloodBank.getAvailabilitySlots();
        if (availabilityList == null || availabilityList.isEmpty()) {
            return new AvailableSlotsDTO(dateStr, Collections.emptyList());
        }

        // 3. Encontrar slots para a data específica
        DailyAvailability daySlots = availabilityList.stream()
                .filter(slot -> slot.getDate() != null && slot.getDate().equals(targetDate))
                .findFirst()
                .orElse(null);

        if (daySlots == null || daySlots.getSlots() == null) {
            return new AvailableSlotsDTO(dateStr, Collections.emptyList());
        }

        // 4. Buscar agendamentos
        List<Donation> allDonations = donationRepository.findAll();
        List<Donation> forThisBank = allDonations.stream()
                .filter(d -> d.getBloodBankId().equals(bloodBankId)).toList();
        List<Donation> bookings = forThisBank.stream()
                .filter(d -> {
                    boolean dateMatches = d.getDate() != null && d.getDate().startsWith(datePrefix);
                    boolean statusMatches = d.getStatus() == Donation.DonationStatus.PENDING ||
                            d.getStatus() == Donation.DonationStatus.CONFIRMED;


                    return dateMatches && statusMatches;
                }).toList();


        // 5. Contar agendamentos por horário
        Map<String, Long> bookingsByHour = bookings.stream()
                .collect(Collectors.groupingBy(
                        d -> d.getHour().trim(),
                        Collectors.counting()
                ));

        // 6. Calcular disponibilidade
        List<AvailableSlotsDTO.SlotInfo> slotsInfo = daySlots.getSlots().stream()
                .map(slot -> {
                    String slotTime = slot.getTime().toString().trim();
                    int totalSpots = slot.getAvailableSpots();
                    int bookedSpots = bookingsByHour.getOrDefault(slotTime, 0L).intValue();
                    int availableSpots = Math.max(0, totalSpots - bookedSpots);

                    return new AvailableSlotsDTO.SlotInfo(
                            slotTime,
                            totalSpots,
                            bookedSpots,
                            availableSpots
                    );
                }).toList();

        return new AvailableSlotsDTO(dateStr, slotsInfo);
    }

    public List<BloodBankResponseDTO> findAllWithAvailableSlots() {
        return bloodBankRepository.findBloodBanksWithAvailableSlots().stream()
                .filter(bloodBank -> !bloodBank.getAvailabilitySlots().isEmpty())
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }
}