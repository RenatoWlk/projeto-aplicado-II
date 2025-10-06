package com.projeto.aplicado.backend.model;

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Getter @Setter
@Document(collection = "questionnaire")
public class EligibilityQuestionnaire {
    @Id
    private String id;
    private String userId;
    private String gender;
    private boolean age;
    private boolean donationBefore60;
    private boolean weight;
    private boolean healthy;
    private boolean pregnant;
    private boolean recentChildbirth;
    private boolean symptoms;
    private boolean diseases;
    private boolean medications;
    private boolean procedures;
    private boolean drugs;
    private boolean partners;
    private boolean tattooOrPiercing;
    private boolean lastDonationMale;
    private boolean lastDonationFemale;
    private boolean covidVaccine;
    private boolean yellowFeverVaccine;
    private boolean travelRiskArea;
    private boolean isEligible;
}
