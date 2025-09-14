package com.projeto.aplicado.backend.dto.user;

import com.projeto.aplicado.backend.model.enums.BloodType;
import com.projeto.aplicado.backend.model.Address;
import lombok.Data;

import java.time.LocalDate;

@Data
public class UserRequestDTO {
    private String name;
    private String email;
    private String password;
    private Address address;
    private String phone;
    private String cpf;
    private String gender;
    private BloodType bloodType;
    private int timeUntilNextDonation;
    private LocalDate lastDonationDate;
}
