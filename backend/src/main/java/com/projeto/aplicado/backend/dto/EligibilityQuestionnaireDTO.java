package com.projeto.aplicado.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter @Setter @ToString
public class EligibilityQuestionnaireDTO {
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
     @JsonProperty("isEligible")
    private boolean eligible;
}
