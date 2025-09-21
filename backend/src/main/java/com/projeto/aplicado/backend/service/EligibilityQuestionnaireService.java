package com.projeto.aplicado.backend.service;

import com.projeto.aplicado.backend.constants.Messages;
import com.projeto.aplicado.backend.dto.EligibilityQuestionnaireDTO;
import com.projeto.aplicado.backend.exception.UserNotFoundException;
import com.projeto.aplicado.backend.model.EligibilityQuestionnaire;
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

    public EligibilityQuestionnaire saveQuestionnaire(EligibilityQuestionnaireDTO dto) throws UserNotFoundException {
        EligibilityQuestionnaire questionnaire = questionnaireRepository
                .findByUserId(dto.getUserId())
                .stream()
                .findFirst()
                .orElse(new EligibilityQuestionnaire());

        questionnaire.setUserId(dto.getUserId());
        questionnaire.setGender(dto.getGender());
        questionnaire.setAge(dto.getAge());
        questionnaire.setDonationBefore60(dto.getDonationBefore60());
        questionnaire.setWeight(dto.getWeight());
        questionnaire.setHealthy(dto.getHealthy());
        questionnaire.setPregnant(dto.getPregnant());
        questionnaire.setRecentChildbirth(dto.getRecentChildbirth());
        questionnaire.setSymptoms(dto.getSymptoms());
        questionnaire.setDiseases(dto.getDiseases());
        questionnaire.setMedications(dto.getMedications());
        questionnaire.setProcedures(dto.getProcedures());
        questionnaire.setDrugs(dto.getDrugs());
        questionnaire.setPartners(dto.getPartners());
        questionnaire.setTattooOrPiercing(dto.getTattooOrPiercing());
        questionnaire.setLastDonationMale(dto.getLastDonationMale());
        questionnaire.setLastDonationFemale(dto.getLastDonationFemale());
        questionnaire.setCovidVaccine(dto.getCovidVaccine());
        questionnaire.setYellowFeverVaccine(dto.getYellowFeverVaccine());
        questionnaire.setTravelRiskArea(dto.getTravelRiskArea());
        questionnaire.setEligible(dto.isEligible());

        if (dto.isEligible()) {
            User user = userRepository.findUserById(dto.getUserId()).orElseThrow(() -> new UserNotFoundException(Role.USER, "User not found with ID provided when unlocking achievement when saving questionnaire"));
            achievementService.unlockAchievementByType(user, "questionnaire_all_correct");
        }

        return questionnaireRepository.save(questionnaire);
    }

    public List<EligibilityQuestionnaire> getAllByUser(String userId) {
        return questionnaireRepository.findByUserId(userId);
    }
}
