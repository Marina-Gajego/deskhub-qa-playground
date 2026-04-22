# k6

Estrutura reservada para testes de performance da API do DeskHub.

## Escopo

O uso de `k6` neste projeto sera dedicado somente a cenarios de API.

## Estrutura

- `scenarios/api/`: scripts de carga, stress ou smoke da API
- `data/`: arquivos auxiliares usados pelos cenarios

## Instalacao

O `k6` nao sera instalado via `npm` neste repositorio.

Instale a ferramenta no sistema operacional e valide no terminal:

```bash
k6 version
```

Exemplos comuns no Windows:

- via Chocolatey: `choco install k6`
- via Scoop: `scoop install k6`

## Estado atual

Apenas a estrutura inicial foi criada. Nenhum script de carga foi implementado ainda.
