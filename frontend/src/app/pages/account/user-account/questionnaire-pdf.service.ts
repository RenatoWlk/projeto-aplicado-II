import { Injectable } from '@angular/core';
import { EligibilityQuestionnaireDTO } from './user-account.service';

@Injectable({
  providedIn: 'root'
})
export class QuestionnairePdfService {

  private readonly expectedAnswers: Record<string, boolean> = {
    age: true,
    weight: true,
    healthy: true,
    donationBefore60: true,
    
    pregnant: false,
    recentChildbirth: false,
    symptoms: false,
    diseases: false,
    medications: false,
    procedures: false,
    drugs: false,
    partners: false,
    tattooOrPiercing: false,
    lastDonationMale: false,
    lastDonationFemale: false,
    covidVaccine: false,
    yellowFeverVaccine: false,
    travelRiskArea: false
  };

  constructor() { }

  generatePDF(questionnaire: EligibilityQuestionnaireDTO, userName: string): void {
    import('jspdf').then((jsPDFModule) => {
      const jsPDF = jsPDFModule.default;
      const doc = new jsPDF();

      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      const lineHeight = 7;
      let yPosition = 20;

      // Cores (RGB)
      const COLOR_RED = [198, 40, 40];
      const COLOR_GREEN = [46, 125, 50];
      const COLOR_BLACK = [0, 0, 0];
      const COLOR_GREY = [117, 117, 117];
      const COLOR_HEADER = [183, 28, 28];

      const addText = (text: string, fontSize: number = 12, isBold: boolean = false, color: number[] = COLOR_BLACK) => {
        doc.setFontSize(fontSize);
        doc.setFont('helvetica', isBold ? 'bold' : 'normal');
        doc.setTextColor(color[0], color[1], color[2]);
        doc.text(text, margin, yPosition);
        yPosition += lineHeight;
      };

      const addLine = () => {
        doc.setDrawColor(200, 200, 200);
        doc.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += lineHeight;
      };

      const checkNewPage = () => {
        if (yPosition > 270) {
          doc.addPage();
          yPosition = 20;
        }
      };

      doc.setFillColor(183, 28, 28);
      doc.rect(0, 0, pageWidth, 40, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('Questionário de Elegibilidade', pageWidth / 2, 15, { align: 'center' });
      doc.setFontSize(14);
      doc.text('Doação de Sangue', pageWidth / 2, 25, { align: 'center' });

      yPosition = 50;

      doc.setTextColor(0, 0, 0);
      addText('Informações do Doador', 16, true, COLOR_HEADER);
      addLine();
      addText(`Nome: ${userName}`, 12, false);
      addText(`Gênero: ${questionnaire.gender}`, 12, false);
      addText(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 12, false);
      yPosition += 5;

      checkNewPage();
      addText('Status de Elegibilidade', 16, true, COLOR_HEADER);
      addLine();
      
      if (questionnaire.eligible) {
        doc.setFillColor(232, 245, 232);
        doc.rect(margin, yPosition - 5, pageWidth - 2 * margin, 15, 'F');
        addText('APTO PARA DOAÇÃO', 14, true, COLOR_GREEN);
      } else {
        doc.setFillColor(255, 235, 238);
        doc.rect(margin, yPosition - 5, pageWidth - 2 * margin, 15, 'F');
        addText('NÃO APTO PARA DOAÇÃO', 14, true, COLOR_RED);
      }
      
      yPosition += 10;

      const addQuestionSection = (title: string, questions: { question: string, answer: boolean | null, field: string }[]) => {
        checkNewPage();
        addText(title, 14, true, COLOR_HEADER);
        addLine();
        
        questions.forEach(q => {
          checkNewPage();
          
          const answerText = q.answer === null ? '-' : (q.answer ? 'Sim' : 'Não');
          
          let answerColor = COLOR_BLACK;
          const expected = this.expectedAnswers[q.field];

          if (q.answer === null) {
             answerColor = COLOR_GREY;
          } else if (expected !== undefined) {
             answerColor = (q.answer === expected) ? COLOR_GREEN : COLOR_RED;
          }

          doc.setFontSize(11);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(0, 0, 0);
          doc.text(q.question, margin, yPosition);
          
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(answerColor[0], answerColor[1], answerColor[2]);
          doc.text(answerText, pageWidth - margin - 15, yPosition);
          
          yPosition += lineHeight;
        });
        
        yPosition += 3;
      };

      addQuestionSection('Critérios Básicos', [
        { question: 'Idade entre 16 e 69 anos?', answer: questionnaire.age ?? null, field: 'age' },
        { question: 'Pesa mais de 50kg?', answer: questionnaire.weight ?? null, field: 'weight' },
        { question: 'Já doou sangue antes dos 60 anos?', answer: questionnaire.donationBefore60 ?? null, field: 'donationBefore60' }
      ]);

      addQuestionSection('Saúde Geral', [
        { question: 'Está se sentindo bem de saúde?', answer: questionnaire.healthy ?? null, field: 'healthy' },
        { question: 'Apresenta sintomas infecciosos?', answer: questionnaire.symptoms ?? null, field: 'symptoms' },
        { question: 'Possui doenças graves?', answer: questionnaire.diseases ?? null, field: 'diseases' },
        { question: 'Está tomando medicamentos?', answer: questionnaire.medications ?? null, field: 'medications' }
      ]);

      if (questionnaire.gender === 'Feminino' || questionnaire.gender === 'feminino') {
        const femaleQuestions = [];
        if (questionnaire.pregnant !== null) femaleQuestions.push({ question: 'Está grávida?', answer: questionnaire.pregnant ?? null, field: 'pregnant' });
        if (questionnaire.recentChildbirth !== null) femaleQuestions.push({ question: 'Teve parto nos últimos 12 meses?', answer: questionnaire.recentChildbirth ?? null, field: 'recentChildbirth' });
        if (questionnaire.lastDonationFemale !== null) femaleQuestions.push({ question: 'Última doação há menos de 90 dias?', answer: questionnaire.lastDonationFemale ?? null, field: 'lastDonationFemale' });
        
        if (femaleQuestions.length > 0) {
          addQuestionSection('Questões Específicas - Mulheres', femaleQuestions);
        }
      }

      if ((questionnaire.gender === 'Masculino' || questionnaire.gender === 'masculino') && questionnaire.lastDonationMale !== null) {
          addQuestionSection('Questões Específicas - Homens', [
            { question: 'Última doação há menos de 60 dias?', answer: questionnaire.lastDonationMale ?? null, field: 'lastDonationMale' }
          ]);
      }

      addQuestionSection('Comportamento de Risco', [
        { question: 'Fez uso de drogas injetáveis?', answer: questionnaire.drugs, field: 'drugs' },
        { question: 'Teve múltiplos parceiros sexuais?', answer: questionnaire.partners, field: 'partners' },
        { question: 'Fez tatuagem nos últimos 12 meses?', answer: questionnaire.tattooOrPiercing, field: 'tattooOrPiercing' }
      ]);

      addQuestionSection('Procedimentos e Vacinas', [
        { question: 'Realizou procedimentos médicos recentes?', answer: questionnaire.procedures, field: 'procedures' },
        { question: 'Tomou vacina COVID-19 nas últimas 48h?', answer: questionnaire.covidVaccine, field: 'covidVaccine' },
        { question: 'Tomou vacina febre amarela nos últimos 30 dias?', answer: questionnaire.yellowFeverVaccine, field: 'yellowFeverVaccine' }
      ]);

      addQuestionSection('Viagens', [
        { question: 'Viajou para áreas de risco recentemente?', answer: questionnaire.travelRiskArea, field: 'travelRiskArea' }
      ]);

      if (!questionnaire.eligible) {
        checkNewPage();
        addText('Recomendações', 14, true, COLOR_HEADER);
        addLine();
        
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);
        
        const recommendations = this.getRecommendations(questionnaire);
        recommendations.forEach(rec => {
          checkNewPage();
          const lines = doc.splitTextToSize(`• ${rec}`, pageWidth - 2 * margin - 5);
          lines.forEach((line: string) => {
            checkNewPage();
            doc.text(line, margin + 5, yPosition);
            yPosition += lineHeight;
          });
        });
      }

      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(9);
        doc.setTextColor(128, 128, 128);
        doc.text(
          `Página ${i} de ${pageCount} - Gerado em ${new Date().toLocaleString('pt-BR')}`,
          pageWidth / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: 'center' }
        );
      }

      const fileName = `Questionario_Doacao_${new Date().getTime()}.pdf`;
      doc.save(fileName);
    });
  }

  private getRecommendations(questionnaire: EligibilityQuestionnaireDTO): string[] {
    const recommendations: string[] = [];
    
    if (!questionnaire.eligible) {
      if (questionnaire.symptoms) recommendations.push('Aguarde até estar completamente recuperado dos sintomas.');
      if (questionnaire.medications) recommendations.push('Consulte sobre a compatibilidade dos seus medicamentos com a doação.');
      if (questionnaire.procedures) recommendations.push('Aguarde o período de recuperação recomendado após procedimentos médicos.');
      if (questionnaire.tattooOrPiercing) recommendations.push('Aguarde 12 meses após tatuagem, piercing ou acupuntura.');
      if (questionnaire.covidVaccine) recommendations.push('Aguarde 48 horas após a vacinação contra COVID-19.');
      if (questionnaire.yellowFeverVaccine) recommendations.push('Aguarde 30 dias após a vacinação contra febre amarela.');
      if (questionnaire.drugs) recommendations.push('Procure orientação médica especializada sobre uso de substâncias.');
      
      if (questionnaire.gender?.toLowerCase() === 'feminino') {
        if (questionnaire.pregnant) recommendations.push('Gestantes não podem doar sangue por questões de segurança.');
        if (questionnaire.recentChildbirth) recommendations.push('Aguarde 12 meses após parto ou aborto.');
        if (questionnaire.lastDonationFemale) recommendations.push('Mulheres devem aguardar 90 dias entre doações.');
      }
      
      if (questionnaire.gender?.toLowerCase() === 'masculino' && questionnaire.lastDonationMale) {
        recommendations.push('Homens devem aguardar 60 dias entre doações.');
      }
      
      if (recommendations.length === 0) {
        recommendations.push('Consulte um profissional de saúde para orientações específicas.');
      }
    }
    
    return recommendations;
  }
}
