package com.projeto.aplicado.backend.dto.partner;

import com.projeto.aplicado.backend.model.enums.Role;
import com.projeto.aplicado.backend.model.Address;
import com.projeto.aplicado.backend.model.Offer;
import lombok.Data;

import java.util.Collections;
import java.util.List;

@Data
public class PartnerResponseDTO {
    private String id;
    private String name;
    private String email;
    private Address address;
    private String phone;
    private Role role;
    private String cnpj;
    private List<Offer> offers;

    public List<Offer> getOffers() {
        return offers == null ? Collections.emptyList() : offers;
    }
}
