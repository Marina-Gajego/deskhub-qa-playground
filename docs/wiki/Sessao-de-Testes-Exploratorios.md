# Relatorio de Sessao de Testes Exploratorios

Este documento registra os resultados de uma sessao de testes exploratorios baseada em heuristicas, focando na quebra de regras de negocio e exploracao de limites do sistema DeskHub.

## Dados da Sessao

| Campo | Valor |
|:--- |:--- |
| **Data e horario de inicio** | 22/04/2026 21:00 |
| **Nome do testador** | Marina Gajego |
| **Test Charter** | **Charter:** Explorar as regras de criacao de reservas e autenticacao, utilizando heuristicas de valores limites (Boundary Value) e acoes contrarias as regras de negocio para identificar falhas logicas e de UX. |
| **Tamanho da sessao** | 30 minutos |

---

## Notas de Teste
- **Autenticacao:** Realizados testes tentando cadastrar e-mails sem formato (ex: `teste_sem_arroba`), nomes apenas com espacos e senhas muito curtas.
- **Dashboard e Reservas:** Tentativa de reservar mesas em datas passadas, reservas com duracao de exatamente 10 horas e sobreposicoes de horários milimetricas (1 minuto).
- **Gerenciamento de Reserva:** Verificado se e possivel excluir reservas de outros usuarios atraves da manipulacao de IDs na URL (IDOR).
- **UX/UI:** Observado comportamento dos cards de mesa quando o nome do usuario e muito longo e como as mensagens de feedback se comportam em telas menores.

---

## Defeitos Encontrados (Resumo)
*Para detalhes tecnicos, consulte o [Relatorio de Bugs](Relatorio-de-Bugs.md).*

1. **Bug de E-mail:** O sistema aceita qualquer string como e-mail no cadastro.
2. **Bug de Nome:** O sistema aceita nomes compostos apenas por espacos vazios.
3. **Bug de Data:** E permitido reservar mesas para datas retroativas (ontem, mes passado).
4. **Bug de Conflito:** O sistema permite reservas duplicadas se a sobreposicao for de exatamente 1 minuto.
5. **Bug de Limite:** A regra de no maximo 2 reservas por dia permite que o usuario faca uma 3a reserva indevida.
6. **Bug de Antecedencia:** A validacao de 1h de antecedencia ignora os minutos do horario atual.

---

## Perguntas
- O sistema deveria permitir que um usuario cancele uma reserva que ja aconteceu (no passado)?
- Existe um limite maximo de dias no futuro para fazer uma reserva (ex: posso reservar para 2030)?
- O campo de e-mail e case-sensitive? (ex: `User@QA.com` e `user@qa.com` sao a mesma pessoa?)

---

## Melhorias Sugeridas
- **Filtros no Dashboard:** Adicionar filtro por "Zona" (ex: Quiet Zone, Social Zone) para facilitar a busca por mesas.
- **Feedback Visual:** Adicionar um icone de carregamento (spinner) nos botoes de enviar para melhorar a percepcao de performance.
- **Confirmacao de Delecao:** No perfil, adicionar um modal de "Tem certeza?" antes de excluir uma reserva para evitar cliques acidentais.
- **Resumo do Dia:** No Dashboard, exibir um resumo de quantas mesas estao livres no total para a data selecionada.

---
*Este relatorio documenta uma sessao focada em heuristica "O Caminho do Vilao", buscando acoes que o sistema nao deveria permitir.*
