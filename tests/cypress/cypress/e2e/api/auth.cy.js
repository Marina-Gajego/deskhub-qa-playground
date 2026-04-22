const {
  createUniqueUserPayload,
  expectAuthSuccessContract,
} = require('../../support/api-helpers');

describe('API Auth - /api/auth/register e /api/auth/login', () => {
  it('deve cadastrar um novo usuario com sucesso e validar o contrato da resposta', () => {
    const user = createUniqueUserPayload('register');

    cy.apiRegister(user).then((response) => {
      expect(response.status).to.eq(201);
      expectAuthSuccessContract(response.body);
      expect(response.body.message).to.eq('Conta criada com sucesso.');
      expect(response.body.user.email).to.eq(user.email);
      expect(response.body.user.name).to.eq(user.name);
    });
  });

  it('deve retornar 409 ao tentar cadastrar um e-mail duplicado', () => {
    const user = createUniqueUserPayload('duplicate');

    cy.apiRegister(user);

    cy.request({
      method: 'POST',
      url: `${Cypress.env('apiUrl')}/api/auth/register`,
      failOnStatusCode: false,
      body: user,
    }).then((response) => {
      expect(response.status).to.eq(409);
      expect(response.body).to.deep.equal({
        message: 'Ja existe uma conta com este e-mail.',
      });
    });
  });

  it('deve retornar 400 quando faltar campo obrigatorio no cadastro', () => {
    cy.request({
      method: 'POST',
      url: `${Cypress.env('apiUrl')}/api/auth/register`,
      failOnStatusCode: false,
      body: {
        name: 'Usuario sem senha',
        email: 'sem-senha@qa.local',
      },
    }).then((response) => {
      expect(response.status).to.eq(400);
      expect(response.body.message).to.eq('Nome, e-mail e senha sao obrigatorios.');
    });
  });

  it('Nao deve aceitar cadastro com e-mail invalido', () => {
    const user = createUniqueUserPayload('invalid-email', {
      email: `texto-sem-formato-${Date.now()}`,
    });

    cy.request({
      method: 'POST',
      url: `${Cypress.env('apiUrl')}/api/auth/register`,
      failOnStatusCode: false,
      body: user,
    }).then((response) => {
      // Regra de negocio violada: O formato do e-mail deve ser validado no cadastro.
      expect(response.status).to.eq(400);
    });
  });

  it('Nao deve aceitar cadastro com nome composto apenas por espacos', () => {
    const user = createUniqueUserPayload('blank-name', {
      name: '   ',
    });

    cy.request({
      method: 'POST',
      url: `${Cypress.env('apiUrl')}/api/auth/register`,
      failOnStatusCode: false,
      body: user,
    }).then((response) => {
      // Regra de negocio violada: O nome de usuario nao pode ser vazio ou conter apenas espacos.
      expect(response.status).to.eq(400);
    });
  });

  it('deve realizar login com sucesso e validar o contrato da resposta', () => {
    const user = createUniqueUserPayload('login');

    cy.apiRegister(user).then(() => {
      cy.apiLogin({
        email: user.email,
        password: user.password,
      }).then((response) => {
        expect(response.status).to.eq(200);
        expectAuthSuccessContract(response.body);
        expect(response.body.message).to.eq('Login realizado com sucesso.');
        expect(response.body.user.email).to.eq(user.email);
      });
    });
  });

  it('deve retornar 401 quando a senha estiver incorreta', () => {
    const user = createUniqueUserPayload('invalid-password');

    cy.apiRegister(user).then(() => {
      cy.request({
        method: 'POST',
        url: `${Cypress.env('apiUrl')}/api/auth/login`,
        failOnStatusCode: false,
        body: {
          email: user.email,
          password: 'SenhaIncorreta!123',
        },
      }).then((response) => {
        expect(response.status).to.eq(401);
        expect(response.body.message).to.eq('Credenciais invalidas.');
      });
    });
  });

  it('deve retornar 400 quando faltar campo obrigatorio no login', () => {
    cy.request({
      method: 'POST',
      url: `${Cypress.env('apiUrl')}/api/auth/login`,
      failOnStatusCode: false,
      body: {
        email: 'usuario@qa.local',
      },
    }).then((response) => {
      expect(response.status).to.eq(400);
      expect(response.body.message).to.eq('Informe e-mail e senha para entrar.');
    });
  });

  it('deve retornar 401 quando o usuario nao existir', () => {
    cy.request({
      method: 'POST',
      url: `${Cypress.env('apiUrl')}/api/auth/login`,
      failOnStatusCode: false,
      body: {
        email: `usuario-inexistente-${Date.now()}@qa.local`,
        password: 'DeskHub@123',
      },
    }).then((response) => {
      expect(response.status).to.eq(401);
      expect(response.body.message).to.eq('Credenciais invalidas.');
    });
  });

  it('deve manter o contrato do usuario sem expor passwordHash', () => {
    const user = createUniqueUserPayload('contract-no-password-hash');

    cy.apiRegister(user).then((response) => {
      expect(response.status).to.eq(201);
      expect(response.body.user).to.not.have.property('passwordHash');
    });
  });
});
