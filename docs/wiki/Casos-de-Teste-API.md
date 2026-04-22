# Casos de Teste API

Este documento apresenta as condições de teste e os casos de teste mapeados para a API do DeskHub, cobrindo autenticação, gestão de mesas e reservas, com foco especial na identificação de bugs lógicos.

## Condições de Teste
1. **Autenticação**: A API deve permitir cadastro e login de usuários, validando campos obrigatórios e unicidade de e-mail.
2. **Gestão de Mesas**: A API deve listar mesas disponíveis para uma data específica e refletir seu status de ocupação.
3. **Gestão de Reservas**: A API deve permitir criar, listar e remover reservas, respeitando horários de funcionamento (08h às 18h).
4. **Validação de Negócio (Bugs Propositais)**:
    - O cadastro deve validar o formato do e-mail.
    - O cadastro deve impedir nomes compostos apenas por espaços.
    - Reservas não devem ser permitidas em datas retroativas.
    - Não deve haver sobreposição de horários (mesmo que de apenas 1 minuto).
    - Limite de no máximo 2 reservas por colaborador no mesmo dia.
    - Reservas no mesmo dia devem respeitar 1 hora de antecedência real (validando horas e minutos).

## Casos de Teste

### 1. Autenticação (Auth)
| ID | Prioridade | Condição | Pré-condição | Passos | Resultado Esperado |
|:---|:---|:---|:---|:---|:---|
| CT01 | Alta | 1 | Nenhuma | 1. POST /api/auth/register com dados válidos. | 201 Created, token e dados do usuário. |
| CT02 | Alta | 1 | E-mail já cadastrado | 1. POST /api/auth/register com e-mail duplicado. | 409 Conflict, mensagem de erro. |
| CT03 | Média | 1 | Nenhuma | 1. POST /api/auth/register omitindo senha. | 400 Bad Request, mensagem de erro. |
| CT04 | Alta | 4 | Bug Conhecido | 1. POST /api/auth/register com e-mail "invalido". | **400 Bad Request** (FALHA ATUAL: 201). |
| CT05 | Média | 4 | Bug Conhecido | 1. POST /api/auth/register com nome "   ". | **400 Bad Request** (FALHA ATUAL: 201). |
| CT06 | Alta | 1 | Usuário cadastrado | 1. POST /api/auth/login com credenciais válidas. | 200 OK, token de acesso. |
| CT07 | Alta | 1 | Usuário cadastrado | 1. POST /api/auth/login com senha incorreta. | 401 Unauthorized, credenciais inválidas. |

### 2. Mesas (Desks)
| ID | Prioridade | Condição | Pré-condição | Passos | Resultado Esperado |
|:---|:---|:---|:---|:---|:---|
| CT11 | Baixa | 2 | Sem token | 1. GET /api/desks?date=YYYY-MM-DD sem Header. | 401 Unauthorized. |
| CT12 | Média | 2 | Usuário logado | 1. GET /api/desks?date=2026-99-99. | 400 Bad Request, data inválida. |
| CT15 | Alta | 2 | Usuário logado | 1. GET /api/desks?date={amanhã}. | 200 OK, lista de 20 mesas. |

### 3. Reservas (Reservations)
| ID | Prioridade | Condição | Pré-condição | Passos | Resultado Esperado |
|:---|:---|:---|:---|:---|:---|
| CT18 | Alta | 3 | Usuário logado | 1. POST /api/reservations com data e hora válidas. | 201 Created, reserva confirmada. |
| CT24 | Alta | 4 | Bug Conhecido | 1. POST /api/reservations com data de ONTEM. | **400 Bad Request** (FALHA ATUAL: 201). |
| CT27 | Alta | 3 | Mesa reservada | 1. POST /api/reservations para horário conflitante. | 409 Conflict, mesa ocupada. |
| CT28 | Alta | 4 | Bug Conhecido | 1. POST /api/reservations com sobreposição de 1min. | **409 Conflict** (FALHA ATUAL: 201). |
| CT29 | Alta | 4 | Bug Conhecido | 1. POST /api/reservations para 3ª reserva no dia. | **400 Bad Request** (FALHA ATUAL: 201). |
| CT34 | Média | 4 | Bug Conhecido | 1. POST /api/reservations para hoje com < 1h de antecedência (minutos). | **400 Bad Request** (FALHA ATUAL: 201). |
| CT36 | Alta | 3 | Reserva existente | 1. DELETE /api/reservations/{id}. | 200 OK, removido com sucesso. |
| CT37 | Alta | 3 | Reserva de outro | 1. DELETE /api/reservations/{id_alheio}. | 403 Forbidden, erro de permissão. |
