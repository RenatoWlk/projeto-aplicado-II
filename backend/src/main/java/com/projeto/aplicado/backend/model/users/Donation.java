package com.bloodbank.model;

import com.projeto.aplicado.backend.model.enums.BloodType;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "donations")
@CompoundIndexes({
        @CompoundIndex(name = "bloodbank_date_hour", def = "{'bloodBankId': 1, 'date': 1, 'hour': 1}"),
        @CompoundIndex(name = "user_date_status", def = "{'userId': 1, 'date': 1, 'status': 1}", unique = true,
                partialFilter = "{ 'status': { '$in': ['PENDING', 'CONFIRMED'] } }")
})
public class Donation {

    @Id
    private String id;

    @Indexed
    private String userId;

    @Indexed
    private String bloodBankId;

    @Indexed
    private String date; // ISO String format: "2025-10-30T00:00:00.000Z"

    private String hour; // Formato: "14:30"

    private Integer slot;

    private BloodType bloodType; // A+, A-, B+, B-, AB+, AB-, O+, O-

    @Indexed
    private DonationStatus status;

    private String notes;

    private String cancellationReason;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    public enum DonationStatus {
        PENDING,
        CONFIRMED,
        COMPLETED,
        CANCELLED,
        NO_SHOW
    }
}
