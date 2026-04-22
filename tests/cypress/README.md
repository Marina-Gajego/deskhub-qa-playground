# Cypress

Estrutura preparada para dois tipos de cobertura:

- `cypress/e2e/web/`: fluxos funcionais da interface web
- `cypress/e2e/api/`: validacoes de API via Cypress

## Instalacao

Na raiz do projeto:

```bash
npm run install:qa
```

Ou diretamente:

```bash
cd tests/cypress
npm install
```

## Execucao futura

Abrir interface do Cypress:

```bash
npm run cypress:open
```

Executar em modo headless:

```bash
npm run cypress:run
```

## Caminho correto do projeto

O projeto Cypress principal deve ser aberto nesta pasta:

```bash
tests/cypress
```
