package com.projeto.aplicado.backend.service;

import com.projeto.aplicado.backend.constants.Messages;
import com.projeto.aplicado.backend.dto.EligibilityQuestionnaireDTO;
import com.projeto.aplicado.backend.dto.notification.ActivateRequestDTO;
import com.projeto.aplicado.backend.exception.UserNotFoundException;
import com.projeto.aplicado.backend.model.EligibilityQuestionnaire;
import com.projeto.aplicado.backend.model.enums.AchievementsNotifications;
import com.projeto.aplicado.backend.model.enums.Role;
import com.projeto.aplicado.backend.model.users.User;
import com.projeto.aplicado.backend.repository.EligibilityQuestionnaireRepository;
import com.projeto.aplicado.backend.repository.UserRepository;
import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
public class EligibilityQuestionnaireService {
    private final EligibilityQuestionnaireRepository questionnaireRepository;
    private final UserRepository userRepository;
    private final AchievementService achievementService;
    private final NotificationService notificationService;

    public EligibilityQuestionnaire saveQuestionnaire(EligibilityQuestionnaireDTO dto) throws UserNotFoundException {
        EligibilityQuestionnaire questionnaire = questionnaireRepository
                .findByUserId(dto.getUserId())
                .stream()
                .findFirst()
                .orElse(new EligibilityQuestionnaire());

        questionnaire.setUserId(dto.getUserId());
        questionnaire.setGender(dto.getGender());
        questionnaire.setAge(dto.isAge());
        questionnaire.setDonationBefore60(dto.isDonationBefore60());
        questionnaire.setWeight(dto.isWeight());
        questionnaire.setHealthy(dto.isHealthy());
        questionnaire.setPregnant(dto.isPregnant());
        questionnaire.setRecentChildbirth(dto.isRecentChildbirth());
        questionnaire.setSymptoms(dto.isSymptoms());
        questionnaire.setDiseases(dto.isDiseases());
        questionnaire.setMedications(dto.isMedications());
        questionnaire.setProcedures(dto.isProcedures());
        questionnaire.setDrugs(dto.isDrugs());
        questionnaire.setPartners(dto.isPartners());
        questionnaire.setTattooOrPiercing(dto.isTattooOrPiercing());
        questionnaire.setLastDonationMale(dto.isLastDonationMale());
        questionnaire.setLastDonationFemale(dto.isLastDonationFemale());
        questionnaire.setCovidVaccine(dto.isCovidVaccine());
        questionnaire.setYellowFeverVaccine(dto.isYellowFeverVaccine());
        questionnaire.setTravelRiskArea(dto.isTravelRiskArea());
        questionnaire.setEligible(dto.isEligible());

        if (dto.isEligible()) {
            User user = userRepository.findUserById(dto.getUserId()).orElseThrow(() -> new UserNotFoundException(Role.USER, "User not found with ID provided when unlocking achievement when saving questionnaire"));
            achievementService.unlockAchievementByType(user, "questionnaire_all_correct");
            ActivateRequestDTO notificationDTO = new ActivateRequestDTO();
            notificationDTO.setUserId(dto.getUserId());
            notificationDTO.setBaseId(AchievementsNotifications.QUESTIONNAIRE_PERFECT.getId());
            notificationDTO.setHoursToExpire(72);
            notificationService.activateForUser(notificationDTO);
        }

        return questionnaireRepository.save(questionnaire);
    }

    public List<EligibilityQuestionnaire> getAllByUser(String userId) {
        return questionnaireRepository.findByUserId(userId);
    }
}
