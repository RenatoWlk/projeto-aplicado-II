package com.projeto.aplicado.backend.controller;

import com.projeto.aplicado.backend.dto.EligibilityQuestionnaireDTO;
import com.projeto.aplicado.backend.model.EligibilityQuestionnaire;
import com.projeto.aplicado.backend.service.EligibilityQuestionnaireService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/questionnaire")
public class EligibilityQuestionnaireController {
    @Autowired
    private EligibilityQuestionnaireService questionnaireService;

    @PostMapping
    public EligibilityQuestionnaire submitQuestionnaire(@RequestBody EligibilityQuestionnaireDTO dto) {
        return questionnaireService.saveQuestionnaire(dto);
    }

    @GetMapping("/{userId}")
    public List<EligibilityQuestionnaire> getUserQuestionnaires(@PathVariable String userId) {
        System.out.println("✅ [Controller] Requisição recebida para /api/questionnaire/" + userId);
        List<EligibilityQuestionnaire> list = questionnaireService.getAllByUser(userId);
        System.out.println("📦 [Controller] Questionários retornados: " + list.size());
        return list;
}

}
