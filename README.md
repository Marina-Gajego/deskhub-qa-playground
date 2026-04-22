# DeskHub

Aplicacao web full stack para reserva de mesas em escritorio, com back-end em Express, front-end em React e persistencia em memoria.

## QA Context

Este projeto foi desenvolvido com foco em testabilidade para estudos de QA manual, QA automatizado e automacao funcional de ponta a ponta.

O sistema contem bugs logicos intencionais, documentados no codigo e neste README, para permitir cenarios controlados de validacao, escrita de casos de teste, automacao de regressao e demonstracao de defeitos.

As decisoes de arquitetura priorizam repetibilidade do ambiente de testes:

- os dados ficam apenas em memoria para que o estado seja resetado rapidamente ao reiniciar a API;
- algumas validacoes foram omitidas de forma intencional para apoiar treinamentos de identificacao de falhas;
- o comportamento simples da aplicacao facilita a criacao de suites com Cypress, Playwright, Postman, Supertest ou ferramentas semelhantes.

## Estrutura

- `backend/`: API Node.js + Express
- `frontend/`: interface React com Vite
- `backend/src/openapi.js`: especificacao Swagger/OpenAPI da API
- `tests/cypress/`: estrutura base para automacao com Cypress
- `tests/k6/`: estrutura base para testes de performance da API com k6

## Regras implementadas no backend

- `RN01`: bloqueio de conflito de agenda por mesa, data e horario
- `RN02`: reservas apenas entre `08:00` e `18:00`
- `RN03`: limite maximo de `9 horas` por reserva
- `RN04`: visualizacao de mesas apenas para usuarios autenticados
- `RN06`: cada colaborador pode ter no maximo `2 reservas` por dia
- `RN07`: para reservas feitas no dia atual, o horario inicial deve respeitar pelo menos `1 hora de antecedencia`

## Bugs propositais incluidos

- Data: reservas em datas passadas continuam sendo aceitas
- Cadastro: o e-mail aceita qualquer texto, sem validacao de formato
- Sobreposicao: conflitos com sobreposicao de exatamente `1 minuto` passam
- Nome: o cadastro aceita nomes compostos apenas por espacos em branco
- Limite diario: quando o usuario ja possui exatamente `2 reservas` no dia, o sistema ainda aceita mais uma
- Antecedencia: para reservas no mesmo dia, a validacao considera apenas a hora atual e ignora os minutos

## Disclaimer

O uso de persistencia em memoria e a ausencia de algumas validacoes especificas sao escolhas deliberadas para simplificar o ciclo de testes.

Objetivo dessas decisoes:

- permitir reset rapido da massa de dados ao reiniciar o servidor;
- evitar dependencias externas como banco de dados;
- manter cenarios previsiveis para reproducao de bugs e execucao repetida de testes.

Este projeto nao representa uma implementacao de producao e deve ser tratado como um ambiente de treinamento e validacao.

## Como rodar

### 1. Instalar dependencias

No diretorio raiz:

```bash
npm run install:all
```

Ou, se preferir, instale separadamente:

```bash
cd backend
npm install
cd ../frontend
npm install
```

### 2. Subir o back-end

Em um terminal:

```bash
cd backend
npm run dev
```

API disponivel em `http://localhost:3001`.

Documentacao OpenAPI disponivel em `http://localhost:3001/api/docs/openapi.json`.

### 3. Subir o front-end

Em outro terminal:

```bash
cd frontend
npm run dev
```

Aplicacao disponivel em `http://localhost:5173`.

## Guia de execucao rapida para QA

Use este fluxo quando quiser repetir o ciclo de testes do zero:

1. Abra um terminal na raiz do projeto.
2. Instale as dependencias na primeira execucao com `npm run install:all`.
3. Suba a API com `npm run dev:backend`.
4. Em outro terminal, suba o front-end com `npm run dev:frontend`.
5. Acesse `http://localhost:5173`.
6. Execute seus cenarios de teste.
7. Para resetar a massa de dados, pare a API e suba novamente.

Como os dados ficam em memoria, reiniciar o processo do back-end limpa usuarios e reservas e devolve o ambiente para um estado previsivel.

## Swagger / OpenAPI

Foi adicionada uma especificacao OpenAPI para facilitar testes manuais, colecoes, mocks e automacao.

Onde acessar:

- endpoint JSON: `http://localhost:3001/api/docs/openapi.json`
- arquivo fonte: `backend/src/openapi.js`

Voce pode usar esse JSON em ferramentas como:

- Swagger Editor
- Postman
- Insomnia
- geradores de clientes HTTP

## Estrutura de automacao

Foi criada a base do repositorio para testes automatizados, sem implementar cenarios ainda.

### Cypress

O Cypress foi separado em dois tipos de cobertura:

- `tests/cypress/cypress/e2e/web/`: testes da interface web
- `tests/cypress/cypress/e2e/api/`: testes de API usando Cypress

Arquivos principais:

- `tests/cypress/package.json`
- `tests/cypress/cypress.config.js`
- `tests/cypress/cypress/support/e2e.js`
- `tests/cypress/cypress/support/commands.js`

### k6

O `k6` foi reservado exclusivamente para testes da API.

Estrutura criada:

- `tests/k6/scenarios/api/`
- `tests/k6/data/`

## Instalacoes necessarias para automacao

### Cypress

Para instalar as dependencias do Cypress:

```bash
npm run install:qa
```

Ou:

```bash
cd tests/cypress
npm install
```

Comandos preparados:

```bash
npm run cypress:open
npm run cypress:run
```

### k6

O `k6` deve ser instalado globalmente na maquina, pois nao faz parte do `npm` deste projeto.

Exemplos de instalacao no Windows:

```bash
choco install k6
```

```bash
scoop install k6
```

Depois de instalar:

```bash
k6 version
```

## O que ainda nao foi implementado

Nesta etapa, somente a estrutura foi preparada.

Ainda nao existem:

- cenarios Cypress para web
- cenarios Cypress para API
- scripts k6 de carga, smoke ou stress
- fixtures de teste
- comandos customizados de automacao

## Fluxo de uso

1. Crie uma conta.
2. Entre na plataforma.
3. Escolha uma data.
4. Consulte a disponibilidade das mesas.
5. Selecione uma mesa e informe horario inicial e final.
6. Confirme a reserva.

## Observacao

Como os dados ficam em memoria, usuarios, mesas e reservas sao perdidos ao reiniciar o servidor.
