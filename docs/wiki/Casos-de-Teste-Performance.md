# Casos de Teste de Performance

Este documento apresenta as condições de teste e os cenários mapeados para os testes de performance da API do DeskHub utilizando o **k6**. O foco é garantir que o sistema (CPU e Memória) suporte múltiplos acessos concorrentes, especialmente em rotas críticas como o processamento de login e a gestão do banco em memória.

## Condições de Teste
1. **Smoke Test (Fumaça)**: Validação rápida com carga mínima (1 a 2 VUs) para garantir que os scripts de teste e as rotas da API estão operando corretamente de ponta a ponta sem erros sistêmicos.
2. **Load Test (Carga de Pico Estimado)**: Simulação do comportamento de múltiplos usuários simultâneos (ex: 20 VUs) durante um período de pico padrão do escritório. Foca em manter a estabilidade do tempo de resposta (p95 < 500ms) e baixa taxa de erros (< 1%).
3. **Stress Test (Carga Extrema)**: Simulação acima da capacidade esperada para descobrir o ponto de ruptura da API, observando como o `Bcrypt` (login) afeta a CPU e como os filtros de data afetam a varredura do array em memória.

## Casos de Teste

### 1. Cenário: Fluxo Completo de Usuário (Load Test)
**Objetivo:** Validar o comportamento do backend sob carga simulando o caminho feliz completo de múltiplos usuários interagindo com o DeskHub simultaneamente.

| ID | Prioridade | Condição | Passos (VU) | Critérios de Sucesso (Thresholds) |
|:---|:---|:---|:---|:---|
| CTP01 | Alta | 2 (Load) | 1. `POST /api/auth/register` (Gerar usuário único) <br> 2. `POST /api/auth/login` (Gerar Token) <br> 3. `GET /api/desks` (Consultar mesas disponíveis do dia) <br> 4. `POST /api/reservations` (Criar reserva em mesa aleatória) <br> 5. `GET /api/reservations/my` (Listar reservas pessoais) <br> 6. `DELETE /api/reservations/:id` (Cancelar reserva criada) | - **http_req_duration**: p(95) < 500ms <br> - **http_req_failed**: rate < 1% <br> - Status HTTP esperado para cada requisição (200, 201 ou 409). |

### 2. Cenário: Smoke Test Simplificado (A Fazer)
**Objetivo:** Garantir a saúde básica da API após deployments sem sobrecarregar a infraestrutura.

| ID | Prioridade | Condição | Passos (VU) | Critérios de Sucesso (Thresholds) |
|:---|:---|:---|:---|:---|
| CTP02 | Média | 1 (Smoke) | 1. `POST /api/auth/login` (Usuário de teste preexistente) <br> 2. `GET /api/desks` | - **http_req_duration**: p(95) < 200ms <br> - **http_req_failed**: rate = 0% <br> - Apenas 1 VU por 10 segundos. |

### 3. Cenário: Stress Test de Autenticação (A Fazer)
**Objetivo:** Isolar o gargalo de CPU causado pelo algoritmo de hashing (Bcrypt) durante o login para identificar o limite de acessos concorrentes suportado pelo Node.js (Event Loop).

| ID | Prioridade | Condição | Passos (VU) | Critérios de Sucesso (Thresholds) |
|:---|:---|:---|:---|:---|
| CTP03 | Baixa | 3 (Stress) | 1. Ramp-up agressivo (0 a 100+ VUs) batendo exclusivamente em `POST /api/auth/login` com credenciais válidas. | - Identificar em qual quantidade de VUs o `http_req_duration` ultrapassa 2000ms ou o servidor começa a retornar erros `50x`. |
