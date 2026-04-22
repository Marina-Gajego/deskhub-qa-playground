# DeskHub QA Playground

Aplicacao web full stack para reserva de mesas em escritorios, desenvolvida como base de estudos para QA manual, QA automatizado, automacao funcional e testes de performance.

## Visao Geral

O DeskHub simula um sistema corporativo de reserva de mesas com:

- cadastro e login de colaboradores;
- visualizacao de mesas por data;
- criacao de reservas com regras de negocio no back-end;
- consulta e cancelamento das reservas do usuario autenticado;
- documentacao Swagger/OpenAPI para apoio a testes;
- estrutura inicial para automacao com Cypress e k6.

## Objetivo do Repositorio

Este repositorio foi montado para servir como ambiente pratico de estudos em:

- levantamento de cenarios de teste;
- escrita de casos de teste;
- automacao web;
- automacao de API;
- testes de carga e performance;
- exploracao de bugs logicos intencionais.

## Stack Tecnica

### Aplicacao

- `Node.js`
- `Express`
- `React`
- `Vite`
- `JWT`
- persistencia em memoria

### Qualidade e Testes

- `Swagger / OpenAPI`
- `Cypress` para testes web e de API
- `k6` para performance da API

## Estrutura do Projeto

```text
deskhub-qa-playground/
├── backend/
├── frontend/
├── tests/
│   ├── cypress/
│   └── k6/
├── docs/
└── README.md
```

### Pastas principais

- `backend/`: API em Node.js com Express
- `frontend/`: interface web em React
- `tests/cypress/`: base da automacao funcional web e de API
- `tests/k6/`: base de testes de performance da API
- `docs/`: documentacao de apoio ao projeto

## Funcionalidades Implementadas

- cadastro de usuario
- login com autenticacao JWT
- visualizacao de mesas por data
- criacao de reservas
- listagem das reservas do proprio usuario
- cancelamento de reservas do proprio usuario
- documentacao Swagger/OpenAPI

## Regras de Negocio Atuais

- `RN01`: a mesma mesa nao pode ser reservada por duas pessoas no mesmo horario e data
- `RN02`: reservas sao aceitas apenas entre `08:00` e `18:00`
- `RN03`: o limite maximo de uma reserva e `9 horas`
- `RN04`: apenas usuarios autenticados podem visualizar mesas
- `RN06`: cada colaborador pode ter no maximo `2 reservas` por dia
- `RN07`: reservas feitas para o mesmo dia exigem pelo menos `1 hora` de antecedencia

## Contexto de QA

Este sistema contem bugs logicos intencionais para fins de treinamento.

Eles existem para apoiar:

- testes exploratorios;
- escrita de evidencias;
- criacao de cenarios automatizados;
- validacao de regressao;
- demonstracoes praticas de defeitos.

### Bugs propositais atualmente presentes

- aceita reservas em datas passadas
- aceita qualquer texto como e-mail
- permite sobreposicao quando o conflito for de exatamente `1 minuto`
- aceita nome composto apenas por espacos em branco
- falha no limite diario quando o usuario ja possui exatamente `2 reservas`
- a antecedencia minima ignora os minutos da hora atual

## Disclaimer

Algumas decisoes deste projeto sao deliberadas para facilitar o uso em estudos:

- persistencia em memoria para reset rapido da massa de dados;
- ausencia de validacoes especificas para apoiar cenarios de falha;
- simplicidade arquitetural para reduzir atrito na automacao.

Este repositorio nao representa um sistema pronto para producao.

## Como Executar Localmente

### 1. Instalar dependencias da aplicacao

Na raiz do projeto:

```bash
npm run install:all
```

### 2. Subir o back-end

```bash
npm run dev:backend
```

API:

- `http://localhost:3001`

Swagger:

- `http://localhost:3001/api/docs`
- `http://localhost:3001/api/docs/openapi.json`

### 3. Subir o front-end

```bash
npm run dev:frontend
```

Aplicacao:

- `http://localhost:5173`

## Execucao Rapida para QA

Fluxo recomendado para repetir testes do zero:

1. instalar dependencias
2. subir back-end
3. subir front-end
4. executar os cenarios
5. reiniciar a API quando quiser resetar a massa de dados

Como os dados ficam em memoria, reiniciar o back-end limpa usuarios e reservas.

## Swagger / OpenAPI

O projeto possui especificacao OpenAPI para apoiar:

- testes manuais
- colecoes de API
- mocks
- integracoes
- automacao

Arquivos e acessos:

- arquivo fonte: `backend/src/openapi.js`
- JSON: `http://localhost:3001/api/docs/openapi.json`
- interface web: `http://localhost:3001/api/docs`

## Estrutura de Automacao

### Cypress

Base preparada para:

- `tests/cypress/cypress/e2e/web/`
- `tests/cypress/cypress/e2e/api/`

Instalacao:

```bash
npm run install:qa
```

Execucao:

```bash
npm run cypress:open
npm run cypress:run
```

### k6

Uso reservado para testes de performance da API.

Estrutura:

- `tests/k6/scenarios/api/`
- `tests/k6/data/`

Instalacao do `k6`:

```bash
choco install k6
```

ou

```bash
scoop install k6
```

Validacao:

```bash
k6 version
```

## Documentacao

- requisitos: [docs/REQUISITOS.md](docs/REQUISITOS.md)
- wiki do projeto: use a wiki do GitHub para documentacao funcional e de QA

## O Que Ainda Nao Foi Implementado

- testes Cypress web
- testes Cypress API
- scripts k6
- fixtures reais de automacao
- comandos customizados de Cypress
- pipeline CI/CD

## Observacao Final

O DeskHub QA Playground foi desenhado para ser simples de entender, facil de resetar e util para praticar qualidade de software em um contexto controlado.
