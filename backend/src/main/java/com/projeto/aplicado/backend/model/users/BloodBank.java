package com.projeto.aplicado.backend.model.users;

import com.projeto.aplicado.backend.model.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.TypeAlias;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.List;

@Document(collection = "users")
@TypeAlias("BloodBank")
@EqualsAndHashCode(callSuper = true)
@Data @NoArgsConstructor
public class BloodBank extends UserBase {
    private String cnpj;
    private List<Campaign> campaigns = new ArrayList<>();
    private Integer scheduledDonations;
    private List<DailyAvailability> availabilitySlots;
}
