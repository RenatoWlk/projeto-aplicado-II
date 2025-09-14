package com.projeto.aplicado.backend.dto.bloodbank;

import com.projeto.aplicado.backend.model.Address;
import lombok.Data;

@Data
public class BloodBankNearbyDTO {
    private String name;
    private Address address;
    private String phone;
    private Double distance;
}
