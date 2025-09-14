package com.projeto.aplicado.backend.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter @Setter @ToString
public class EligibilityQuestionnaireDTO {
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
    private String Partners;
    private String tattooOrPiercing;
    private String lastDonationMale;
    private String lastDonationFemale;
    private String covidVaccine;
    private String yellowFeverVaccine;
    private String travelRiskArea;
    private boolean isEligible;
    private String resultMessage;
}
