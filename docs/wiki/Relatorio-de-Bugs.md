# Relatorio de Bugs (Defect Log)

Este documento centraliza o reporte dos bugs logicos intencionais encontrados durante as sessoes de teste (Manuais, API e E2E) no DeskHub. O objetivo e demonstrar a capacidade de identificacao, triagem e documentacao de falhas.

## Resumo Executivo
- **Total de Bugs Mapeados:** 6
- **Status da Correcao:** Aguardando Ajuste no Backend
- **Ambiente de Teste:** Local (127.0.0.1)

---

## Lista de Defeitos

| ID | Titulo do Bug | Severidade | Status | Issue GitHub |
|:---|:---|:---|:---|:---|
| BUG01 | Falta de validacao de formato de e-mail | Alta | Aberto | [Link para Issue #1](#) |
| BUG02 | Cadastro permite nome apenas com espacos | Media | Aberto | [Link para Issue #2](#) |
| BUG03 | Criacao de reserva em data passada | Alta | Aberto | [Link para Issue #3](#) |
| BUG04 | Conflito de reserva falha em 1 minuto de sobreposicao | Critica | Aberto | [Link para Issue #4](#) |
| BUG05 | Falha no limite diario (permite a 3a reserva) | Media | Aberto | [Link para Issue #5](#) |
| BUG06 | Regra de antecedencia ignora os minutos | Media | Aberto | [Link para Issue #6](#) |

---

## Detalhamento dos Bugs

### BUG01 - Validacao de E-mail
- **Impacto:** Permite a criacao de contas com dados invalidos, impossibilitando comunicacoes futuras e comprometendo a integridade da base.
- **Evidencia:** Retorno `201 Created` para o payload `{"email": "invalido"}`.
- **Issue GitHub:** [Link da Issue](#)

### BUG02 - Nome em Branco
- **Impacto:** Usuarios aparecem sem identificacao no dashboard e no chip de boas-vindas, gerando uma UX pobre e falha visual.
- **Evidencia:** API aceita `{"name": "   "}` sem retornar erro 400.
- **Issue GitHub:** [Link da Issue](#)

### BUG03 - Reserva no Passado
- **Impacto:** Compromete as metricas de ocupacao e permite dados inconsistentes no historico.
- **Evidencia:** Sucesso ao reservar mesa para 5 dias atras.
- **Issue GitHub:** [Link da Issue](#)

### BUG04 - Sobreposicao de 1 Minuto
- **Impacto:** Duas pessoas podem ocupar a mesma mesa simultaneamente no ultimo minuto de uma reserva. Risco de conflito fisico no escritorio.
- **Evidencia:** Segunda reserva aceita para `10:59` quando a primeira termina as `11:00`.
- **Issue GitHub:** [Link da Issue](#)

### BUG05 - Limite Diario (RN06)
- **Impacto:** Viola a politica de compartilhamento de recursos da empresa.
- **Evidencia:** O sistema permite 3 reservas para o mesmo dia, bloqueando apenas na 4a tentativa.
- **Issue GitHub:** [Link da Issue](#)

### BUG06 - Antecedencia Minima (RN07)
- **Impacto:** Colaboradores podem reservar mesas para ocupacao imediata, quebrando o fluxo de preparacao do ambiente.
- **Evidencia:** Comparacao de horas ignora minutos (Ex: 14:50 permite reserva para as 15:10).
- **Issue GitHub:** [Link da Issue](#)

---
*Ultima atualizacao: 2026-04-22*
