package com.projeto.aplicado.backend.dto.bloodbank;

import com.projeto.aplicado.backend.model.DonationsOverTime;
import com.projeto.aplicado.backend.model.enums.BloodType;
import com.projeto.aplicado.backend.model.enums.Role;
import com.projeto.aplicado.backend.model.Address;
import com.projeto.aplicado.backend.model.Campaign;
import lombok.Data;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@Data
public class BloodBankResponseDTO {
    private String id;
    private String name;
    private String email;
    private Address address;
    private String phone;
    private Role role;
    private String cnpj;
    private List<Campaign> campaigns;
    private int totalDonations;
    private Integer scheduledDonations;
    private List<DonationsOverTime> donationsOverTime;
    private Map<BloodType, Integer> bloodTypeBloodBags;
    public List<Campaign> getCampaigns() {
        return campaigns == null ? Collections.emptyList() : campaigns;
    }
}
