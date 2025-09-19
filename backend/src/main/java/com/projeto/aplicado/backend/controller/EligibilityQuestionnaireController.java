package com.projeto.aplicado.backend.controller;

import com.projeto.aplicado.backend.dto.EligibilityQuestionnaireDTO;
import com.projeto.aplicado.backend.model.EligibilityQuestionnaire;
import com.projeto.aplicado.backend.service.EligibilityQuestionnaireService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/questionnaire")
@RequiredArgsConstructor
public class EligibilityQuestionnaireController {
    private EligibilityQuestionnaireService questionnaireService;

    @PostMapping
    public EligibilityQuestionnaire submitQuestionnaire(@RequestBody EligibilityQuestionnaireDTO dto) {
        return questionnaireService.saveQuestionnaire(dto);
    }

    @GetMapping("/{id}")
    public List<EligibilityQuestionnaire> getUserQuestionnairesById(@PathVariable String id) {
        return questionnaireService.getAllByUser(id);
    }
}
