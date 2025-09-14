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
    private String age;
    private String donationBefore60;
    private String weight;
    private String healthy;
    private String pregnant;
    private String recentChildbirth;
    private String symptoms;
    private String diseases;
    private String medications;
    private String procedures;
    private String drugs;
    private String partners;
    private String tattooOrPiercing;
    private String lastDonationMale;
    private String lastDonationFemale;
    private String covidVaccine;
    private String yellowFeverVaccine;
    private String travelRiskArea;
    private boolean isEligible;
    private String resultMessage;
}
