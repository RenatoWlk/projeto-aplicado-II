package com.projeto.aplicado.backend.dto;

import lombok.Data;
//import javax.validation.constraints.NotBlank;
//import javax.validation.constraints.Size;

@Data
public class ChangePasswordDTO {
    //@NotBlank(message = "Senha atual é obrigatória")
    private String currentPassword;
    
    //@NotBlank(message = "Nova senha é obrigatória")
    //@Size(min = 6, message = "A senha deve ter no mínimo 6 caracteres")
    private String newPassword;
}
