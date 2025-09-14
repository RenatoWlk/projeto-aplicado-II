package com.projeto.aplicado.backend.model.users;

import com.projeto.aplicado.backend.model.Offer;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.TypeAlias;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.List;

@Document(collection = "users")
@TypeAlias("Partner")
@EqualsAndHashCode(callSuper = true)
@Data @NoArgsConstructor @AllArgsConstructor
public class Partner extends UserBase {
    private String cnpj;
    private List<Offer> offers = new ArrayList<>();
}
