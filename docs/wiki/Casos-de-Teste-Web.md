# Casos de Teste Web (E2E)

Este documento apresenta os cenários de teste automatizados para a interface (Frontend) do DeskHub utilizando o **Cypress**. O foco é garantir o funcionamento correto dos fluxos de interface, interações do usuário e integração com a API.

## Estrutura da Suíte
Os testes estão divididos em três grupos principais para facilitar a manutenção e organização:
1. **Autenticação (`auth.cy.js`)**: Fluxos de login, registro, logout e validações de formulário.
2. **Dashboard (`dashboard.cy.js`)**: Listagem de mesas, troca de datas e criação de reservas.
3. **Perfil (`profile.cy.js`)**: Visualização de dados do usuário e gerenciamento/cancelamento de reservas.

---

## Casos de Teste

### 1. Autenticação (Auth)
**Objetivo:** Garantir que o usuário consiga entrar, sair e se cadastrar na plataforma, além de receber os feedbacks adequados em caso de erro.

| ID | Cenário | Passos | Resultado Esperado |
|:---|:---|:---|:---|
| CTW01 | Criar conta com sucesso | 1. Acessar aba "Criar conta".<br>2. Preencher nome, e-mail e senha.<br>3. Clicar em Submit. | Exibe mensagem de sucesso, nome no chip de boas-vindas e redireciona para o Painel. |
| CTW02 | Validar campos obrigatórios no cadastro | 1. Acessar aba "Criar conta".<br>2. Clicar no campo "Nome" e remover o foco (blur).<br>3. Clicar em Submit com campos vazios. | O navegador bloqueia o envio (`validationMessage` ativa). |
| CTW03 | Login com usuário válido | 1. Cadastrar usuário via API.<br>2. Preencher e-mail e senha corretos na tela de login.<br>3. Clicar em Submit. | Redireciona para o Painel de reservas. |
| CTW04 | Login com credenciais inválidas | 1. Preencher e-mail válido e senha incorreta.<br>2. Clicar em Submit. | Exibe `.feedback.error` com "Credenciais invalidas." |
| CTW05 | Logout com sucesso | 1. Realizar login.<br>2. Clicar no botão "Sair" na topbar. | O usuário é desconectado e o painel de autenticação volta a ser exibido. |

---

### 2. Dashboard de Mesas e Reservas
**Objetivo:** Validar a interação com o grid de mesas, filtros de data e formulário de nova reserva.

| ID | Cenário | Passos | Resultado Esperado |
|:---|:---|:---|:---|
| CTW06 | Listagem inicial de mesas | 1. Realizar login.<br>2. Verificar o título "Painel de reservas". | A interface lista exatamente 20 mesas (cards `.desk-item`). |
| CTW07 | Criar reserva com sucesso (Dados Dinâmicos) | 1. Selecionar uma data no futuro (+5 a 15 dias).<br>2. Escolher uma mesa aleatória.<br>3. Preencher horários (09:00 - 12:00) e salvar. | Exibe mensagem de sucesso e atualiza o card da mesa no grid para "Reservada no dia" com os horários. |
| CTW08 | Validar regra de negócio na UI (Duração) | 1. Selecionar mesa e data.<br>2. Preencher horários com duração de 10 horas (ex: 08:00 - 18:00).<br>3. Clicar em Reservar. | A API rejeita a requisição e a UI exibe `.feedback.error` sobre limite de 9 horas. |

---

### 3. Meu Perfil
**Objetivo:** Garantir que o usuário tenha controle sobre seus dados e consiga visualizar e excluir as reservas que criou.

| ID | Cenário | Passos | Resultado Esperado |
|:---|:---|:---|:---|
| CTW09 | Exibição de dados do usuário | 1. Realizar login.<br>2. Acessar tela "Meu perfil". | Os dados básicos (Nome e E-mail) são exibidos corretamente nos cards de resumo. |
| CTW10 | Listagem de reservas ativas | 1. Criar uma reserva via API no background.<br>2. Acessar "Meu perfil". | O card de reservas exibe a mesa e os horários reservados corretamente na lista. |
| CTW11 | Cancelar reserva com sucesso | 1. Identificar uma reserva na lista.<br>2. Clicar no botão "Remover" e confirmar o prompt. | Exibe mensagem de sucesso, remove a linha da tabela e exibe o estado vazio ("Voce ainda nao tem reservas"). |
