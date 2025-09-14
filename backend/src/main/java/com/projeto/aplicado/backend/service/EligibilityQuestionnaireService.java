package com.projeto.aplicado.backend.service;

import com.projeto.aplicado.backend.dto.EligibilityQuestionnaireDTO;
import com.projeto.aplicado.backend.model.EligibilityQuestionnaire;
import com.projeto.aplicado.backend.repository.EligibilityQuestionnaireRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EligibilityQuestionnaireService {
    private final EligibilityQuestionnaireRepository questionnaireRepository;

    @Autowired
    public EligibilityQuestionnaireService(EligibilityQuestionnaireRepository questionnaireRepository) {
        this.questionnaireRepository = questionnaireRepository;
    }

    public EligibilityQuestionnaire saveQuestionnaire(EligibilityQuestionnaireDTO dto) {
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
        questionnaire.setResultMessage(dto.getResultMessage());

        System.out.println("DTO recebido: " + dto);

        return questionnaireRepository.save(questionnaire);
    }

    public List<EligibilityQuestionnaire> getAllByUser(String userId) {
    System.out.println("📥 [Service] Buscando questionários para usuário: " + userId);
    List<EligibilityQuestionnaire> questionnaires = questionnaireRepository.findByUserId(userId);
    System.out.println("📊 [Service] Total encontrado: " + questionnaires.size());
    return questionnaires;
}

}
