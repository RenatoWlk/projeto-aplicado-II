package com.projeto.aplicado.backend.service;

import com.projeto.aplicado.backend.constants.Messages;
import com.projeto.aplicado.backend.dto.ChangePasswordDTO;
import com.projeto.aplicado.backend.dto.notification.ActivateRequestDTO;
import com.projeto.aplicado.backend.dto.user.UserLocationDTO;
import com.projeto.aplicado.backend.dto.user.UserStatsDTO;
import com.projeto.aplicado.backend.dto.user.UserRequestDTO;
import com.projeto.aplicado.backend.dto.user.UserResponseDTO;
import com.projeto.aplicado.backend.exception.UserNotFoundException;
import com.projeto.aplicado.backend.model.users.User;
import com.projeto.aplicado.backend.model.Address;
import com.projeto.aplicado.backend.model.enums.Role;
import com.projeto.aplicado.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.text.Normalizer;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final AchievementService achievementService;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;
    private final GeolocationService geolocationService;
    private final NotificationService notificationService;

    /**
     * Creates a new user in the system.
     * 
     * @param dto the user request DTO containing user details
     * @return the created user response DTO
     */
    public UserResponseDTO create(UserRequestDTO dto) {
        User user = new User();
        user.setName(dto.getName());
        user.setEmail(dto.getEmail());
        user.setPassword(passwordEncoder.encode(dto.getPassword()));
        user.setAddress(dto.getAddress());
        user.setPhone(dto.getPhone());
        user.setRegistrationDate(LocalDate.now());
        user.setRole(Role.USER);
        user.setCpf(dto.getCpf());
        user.setGender(dto.getGender());
        user.setBloodType(dto.getBloodType());
        user.setTimesDonated(0);
        user.setTimeUntilNextDonation(0);
        user.setLastDonationDate(null);
        user.setUnlockedAchievements(List.of());
        user.setScheduledDonations(List.of());
        user.setTotalPoints(0);
        user.setRedeemedRewardsIds(null);
        user.setActiveNotifications(List.of());

        user = userRepository.save(user);
        return toResponseDTO(user);
    }

    /**
     * Finds a user by ID.
     * 
     * @param id the ID of the user to find.
     * @return the user response DTO.
     * @throws UserNotFoundException In case the user was not found with the ID provided.
     */
    public UserResponseDTO findById(String id) throws UserNotFoundException {
        return userRepository.findUserById(id)
                .map(this::toResponseDTO)
                .orElseThrow(() -> new UserNotFoundException(Role.USER, "User not found with ID provided when finding by ID"));
    }

    /**
     * Unlocks the map opened achievement if the user is not partner or blood bank.
     *
     * @param id the ID of the user.
     * @throws UserNotFoundException In case the user was not found with the ID provided
     */
    public void unlockMapAchievement(String id) {
        Optional<User> opt = userRepository.findById(id);
        if (opt.isEmpty()) {
            return;
        }

        User user = opt.get();
        if (user.getRole() != Role.USER) {
            return;
        }
        achievementService.unlockAchievementByType(user, "map_opened");

        // Create notification
        ActivateRequestDTO request = new ActivateRequestDTO();
        request.setUserId(id);
        request.setBaseId("achievement_opened_map");
        request.setHoursToExpire(72);
        notificationService.activateForUser(request);
    }

    /**
     * Finds user statistics by ID.
     * 
     * @param id The ID of the user to find statistics for.
     * @return The user statistics DTO.
     * @throws UserNotFoundException In case the user was not found with the ID provided.
     */
    public UserStatsDTO findStatsById(String id) throws UserNotFoundException {
        return userRepository.findUserById(id)
                .map(this::toStatsDTO)
                .orElseThrow(() -> new UserNotFoundException(Role.USER, "User not found with ID provided when finding stats by ID"));
    }

    public UserLocationDTO findLocationById(String id) throws UserNotFoundException {
        return userRepository.findById(id)
            .map(user -> {
                UserLocationDTO dto = toLocationDTO(user);

                try {
                    String address = removeAccents(user.getAddress().getStreet().toLowerCase());
                    double[] coordinates = geolocationService.getCoordinatesFromAddress(address);
                    dto.setLatitude(coordinates[0]);
                    dto.setLongitude(coordinates[1]);
                } catch (Exception e) {
                    System.err.println("Error trying to get the coords: " + e.getMessage());
                    dto.setLatitude(0.0);
                    dto.setLongitude(0.0);
                }

                return dto;
            })
            .orElseThrow(() -> new UserNotFoundException(Role.USER, "User not found with ID provided when finding location by ID"));
    }

    private UserResponseDTO toResponseDTO(User user) {
        UserResponseDTO dto = new UserResponseDTO();
        dto.setId(user.getId());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setAddress(user.getAddress());
        dto.setPhone(user.getPhone());
        dto.setRole(user.getRole());
        dto.setCpf(user.getCpf());
        dto.setGender(user.getGender());
        dto.setBloodType(user.getBloodType());
        return dto;
    }

    private void mapDtoToEntity(UserRequestDTO dto, User user) {
        if (dto.getName() != null) user.setName(dto.getName());
        if (dto.getEmail() != null) user.setEmail(dto.getEmail());
        if (dto.getPhone() != null) user.setPhone(dto.getPhone());
        if (dto.getGender() != null) user.setGender(dto.getGender());

        if (dto.getAddress() != null) {
            if (user.getAddress() == null) user.setAddress(new Address());
            Address address = user.getAddress();
            if (dto.getAddress().getStreet() != null) address.setStreet(dto.getAddress().getStreet());
        }
    }

    private UserStatsDTO toStatsDTO(User user) {
        UserStatsDTO dto = new UserStatsDTO();
        dto.setTimesDonated(user.getTimesDonated());
        dto.setTimeUntilNextDonation(user.getTimeUntilNextDonation());
        dto.setLastDonationDate(user.getLastDonationDate());
        dto.setAchievements(achievementService.getAchievementsFromUser(user));
        dto.setTotalPoints(user.getTotalPoints());
        dto.setBloodType(user.getBloodType());
        return dto;
    }

    private UserLocationDTO toLocationDTO(User user) {
        UserLocationDTO dto = new UserLocationDTO();
        dto.setName(user.getName());
        dto.setPhone(user.getPhone());
        dto.setAddress(user.getAddress());
        return dto;
    }

    public void sendPasswordRecoveryEmail(String email) {
        Optional<User> userOpt = userRepository.findUserByEmail(email);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            String message = "Olá " + user.getName() + ",\n\n" +
                             "Seu login é: " + user.getEmail() + "\n\n" +
                             "Sua senha é: " + user.getPassword() + "\n\n";

            emailService.sendEmail(user.getEmail(), "Recuperação de Dados de Acesso", message);
        }
    }

    public String removeAccents(String input) {
        String normalized = Normalizer.normalize(input, Normalizer.Form.NFD);
        return normalized.replaceAll("\\p{InCombiningDiacriticalMarks}+", "");
    }

    public UserResponseDTO update(String id, UserRequestDTO dto) throws UserNotFoundException, BadCredentialsException {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new UserNotFoundException(Role.USER, "User not found with the ID provided when updating"));
        
        if (!user.getEmail().equals(dto.getEmail()) &&
            userRepository.existsByEmail(dto.getEmail())) {
            throw new BadCredentialsException("Email already exists");
        }
        
        mapDtoToEntity(dto,user);
        
        User updatedUser = userRepository.save(user);
        return toResponseDTO(updatedUser);
    }

    public void delete(String id) throws UserNotFoundException {
        if (!userRepository.existsById(id)) {
            throw new UserNotFoundException(Role.USER, "User not found with ID provided when deleting");
        }
        userRepository.deleteById(id);
    }

    public void changePassword(String id, ChangePasswordDTO dto) throws UserNotFoundException, BadCredentialsException {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new UserNotFoundException(Role.USER, "User not found with ID provided when changing password"));
        
        if (!passwordEncoder.matches(dto.getCurrentPassword(), user.getPassword())) {
            throw new BadCredentialsException("Incorrect password");
        }
        
        user.setPassword(passwordEncoder.encode(dto.getNewPassword()));
        userRepository.save(user);
    }
}
