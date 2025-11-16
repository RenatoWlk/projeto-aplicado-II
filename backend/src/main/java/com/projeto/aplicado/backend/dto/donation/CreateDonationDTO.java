package com.projeto.aplicado.backend.dto.donation;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class CreateDonationDTO {

    @NotBlank(message = "User ID é obrigatório")
    private String userId;

    @NotBlank(message = "Blood bank ID é obrigatório")
    private String bloodBankId;

    @NotBlank(message = "Data é obrigatória")
    private String date; // ISO String

    @NotBlank(message = "Hora é obrigatória")
    @Pattern(regexp = "^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$", message = "Formato de hora inválido (HH:MM)")
    private String hour;

    @NotNull(message = "Slot é obrigatório")
    @Min(value = 1, message = "Slot deve ser maior que 0")
    private Integer slot;
}

