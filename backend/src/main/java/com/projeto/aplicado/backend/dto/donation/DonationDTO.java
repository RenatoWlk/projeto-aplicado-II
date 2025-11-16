package com.projeto.aplicado.backend.dto.donation;

import com.bloodbank.model.Donation;
import com.projeto.aplicado.backend.model.enums.BloodType;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class DonationDTO {
    private String id;
    private String userId;
    private String userName;
    private String userPhone;
    private String userEmail;
    private String bloodBankId;
    private String bloodBankName;
    private String bloodBankAddress;
    private String date;
    private String hour;
    private Integer slot;
    private BloodType bloodType;
    private Donation.DonationStatus status;
    private String notes;
    private String cancellationReason;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
