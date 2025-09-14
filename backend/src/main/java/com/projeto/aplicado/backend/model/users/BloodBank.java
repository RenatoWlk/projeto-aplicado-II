package com.projeto.aplicado.backend.model.users;

import com.projeto.aplicado.backend.model.Campaign;
import com.projeto.aplicado.backend.model.DonationsOverTime;
import com.projeto.aplicado.backend.model.enums.BloodType;
import com.projeto.aplicado.backend.model.AvailabilitySlot;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.TypeAlias;
import org.springframework.data.mongodb.core.mapping.Document;


import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Document(collection = "users")
@TypeAlias("BloodBank")
@EqualsAndHashCode(callSuper = true)
@Data @NoArgsConstructor
public class BloodBank extends UserBase {
    private String cnpj;
    private List<Campaign> campaigns = new ArrayList<>();
    private int totalDonations;
    private Integer scheduledDonations;
    private List<DonationsOverTime> donationsOverTime;
    private Map<BloodType, Integer> bloodTypeBloodBags;
    private List<AvailabilitySlot> availabilitySlots = new ArrayList<>();
}
