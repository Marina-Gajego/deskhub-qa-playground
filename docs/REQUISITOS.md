# Requisitos do Sistema DeskHub

## 1. Visao Geral

O DeskHub e uma aplicacao web para reserva de mesas em escritorios corporativos.

O objetivo do sistema e permitir que colaboradores:

- criem uma conta;
- realizem login;
- consultem a disponibilidade das mesas;
- registrem reservas por data e horario;
- acompanhem e removam suas proprias reservas.

Este projeto foi concebido tambem como ambiente de estudos para QA manual, QA automatizado e automacao funcional.

## 2. Objetivo do Produto

Centralizar o processo de reserva de mesas em um unico sistema web, reduzindo controles paralelos e permitindo validacoes de disponibilidade em tempo real dentro do contexto da aplicacao.

## 3. Escopo

O sistema contempla:

- autenticacao de usuarios;
- visualizacao de mesas disponiveis por data;
- criacao de reservas;
- consulta das reservas do usuario autenticado;
- cancelamento de reservas do proprio usuario;
- documentacao OpenAPI para suporte a testes e integracoes.

O sistema nao contempla:

- banco de dados persistente;
- envio de notificacoes;
- administracao de usuarios;
- controle de perfis e permissoes avancadas;
- integracao com sistemas externos.

## 4. Perfis de Usuario

### 4.1 Colaborador

Usuario comum da plataforma, responsavel por:

- criar conta;
- autenticar-se no sistema;
- consultar mesas;
- criar reservas;
- consultar suas reservas;
- cancelar suas proprias reservas.

## 5. Requisitos Funcionais

### RF01. Cadastro de usuario

O sistema deve permitir que um colaborador crie uma conta informando:

- nome;
- e-mail;
- senha.

### RF02. Login de usuario

O sistema deve permitir que o colaborador realize login usando:

- e-mail;
- senha.

### RF03. Controle de sessao autenticada

O sistema deve manter o usuario autenticado para acesso as funcionalidades restritas da plataforma.

### RF04. Restricao de acesso as mesas

O sistema deve permitir a visualizacao das mesas somente para usuarios autenticados.

### RF05. Consulta de mesas por data

O sistema deve permitir que o usuario consulte a lista de mesas para uma data especifica.

Cada mesa deve apresentar:

- identificador;
- numeracao;
- zona;
- status de ocupacao;
- reservas vinculadas a data consultada.

### RF06. Exibicao de status das mesas

O sistema deve classificar cada mesa como:

- livre;
- reservada.

### RF07. Criacao de reserva

O sistema deve permitir que o usuario autenticado crie uma reserva informando:

- mesa;
- data;
- horario inicial;
- horario final.

### RF08. Consulta de reservas do proprio usuario

O sistema deve permitir que o usuario autenticado visualize suas reservas.

### RF09. Cancelamento de reserva

O sistema deve permitir que o usuario autenticado remova apenas reservas criadas por ele mesmo.

### RF10. Documentacao de API

O sistema deve disponibilizar documentacao da API em formato OpenAPI/Swagger para apoiar testes, integracoes e validacoes tecnicas.

## 6. Regras de Negocio

### RN01. Conflito de agenda por mesa

Uma mesma mesa nao pode ser reservada por duas pessoas no mesmo horario e data.

### RN02. Faixa de horario permitida

Reservas so podem acontecer entre `08:00` e `18:00`.

### RN03. Duracao maxima da reserva

Uma unica reserva nao pode ultrapassar `9 horas`.

### RN04. Acesso autenticado obrigatorio

A visualizacao das mesas deve estar disponivel apenas para usuarios autenticados.

### RN05. Limite diario por colaborador

Cada colaborador pode possuir no maximo `2 reservas` no mesmo dia.

### RN06. Antecedencia minima no mesmo dia

Quando a reserva for feita para a data atual, o horario inicial deve respeitar pelo menos `1 hora` de antecedencia.

## 7. Requisitos de Interface

### RI01. Tela de autenticacao

O sistema deve possuir uma tela inicial com:

- alternancia entre login e cadastro;
- campos necessarios para autenticacao;
- mensagens de retorno ao usuario.

### RI02. Tela de mesas

O sistema deve possuir uma area dedicada para:

- escolher a data;
- visualizar a lista de mesas;
- identificar o status de cada mesa;
- visualizar reservas existentes por mesa.

### RI03. Tela de nova reserva

O sistema deve permitir registrar reservas a partir de um formulario com:

- selecao de mesa;
- selecao de data;
- horario inicial;
- horario final.

### RI04. Area de perfil

O sistema deve possuir uma area de perfil onde o usuario consiga:

- visualizar suas reservas;
- remover reservas proprias.

## 8. Requisitos de API

### RA01. Endpoint de saude

O sistema deve expor um endpoint para verificar se a API esta online.

### RA02. Endpoints de autenticacao

O sistema deve expor endpoints para:

- cadastro;
- login.

### RA03. Endpoints de consulta

O sistema deve expor endpoints para:

- consultar mesas por data;
- consultar reservas do usuario autenticado.

### RA04. Endpoints de reservas

O sistema deve expor endpoints para:

- criar reserva;
- cancelar reserva.

### RA05. Endpoint de documentacao

O sistema deve expor endpoint para acesso ao JSON OpenAPI e a interface Swagger.

## 9. Requisitos Nao Funcionais

### RNF01. Arquitetura

O sistema deve ser composto por:

- front-end em React;
- back-end em Node.js com Express.

### RNF02. Persistencia

Os dados do sistema devem ser mantidos em memoria no servidor, sem uso de banco de dados.

### RNF03. Ambiente de testes

O sistema deve ser simples de reiniciar para restaurar a massa de dados e facilitar ciclos repetitivos de teste.

### RNF04. Testabilidade

O sistema deve possuir estrutura preparada para:

- testes funcionais web com Cypress;
- testes de API com Cypress;
- testes de performance de API com k6.

### RNF05. Documentacao tecnica

O sistema deve manter documentacao suficiente para:

- execucao local;
- entendimento de regras;
- uso da API;
- apoio a validacao e automacao.

## 10. Premissas Tecnicas

- a aplicacao opera localmente em ambiente de desenvolvimento;
- os dados sao perdidos ao reiniciar o back-end;
- a autenticacao utiliza token JWT;
- as mesas sao predefinidas em memoria pela aplicacao.

## 11. Restricoes

- nao utilizar banco de dados relacional ou nao relacional;
- nao implementar persistencia externa;
- nao depender de servicos terceiros para o fluxo principal;
- manter foco em um ambiente controlado para estudo e validacao.

## 12. Criterios Gerais de Aceitacao

- o usuario deve conseguir cadastrar-se e autenticar-se;
- apenas usuarios autenticados devem conseguir visualizar mesas;
- o usuario deve conseguir consultar mesas por data;
- o usuario deve conseguir criar reservas dentro das regras de negocio;
- o usuario deve conseguir visualizar suas reservas;
- o usuario deve conseguir remover suas proprias reservas;
- a API deve possuir documentacao Swagger/OpenAPI acessivel;
- a base do repositorio deve possuir estrutura para automacao com Cypress e k6.

## 13. Observacao para QA

O projeto contem bugs logicos intencionais para fins de treinamento e validacao de cenarios de teste.

Esses comportamentos nao devem ser tratados como referencia de produto final, mas sim como parte do contexto controlado de estudos de qualidade e automacao.
