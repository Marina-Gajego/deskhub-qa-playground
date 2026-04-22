const { createUniqueUserPayload } = require('../../support/api-helpers');

describe('E2E Web - Autenticacao', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('deve permitir criar uma conta e acessar o painel', () => {
    const user = createUniqueUserPayload('web-register');

    cy.get('.auth-tabs button').contains('Criar conta').click();
    cy.get('input[name="name"]').type(user.name);
    cy.get('input[name="email"]').type(user.email);
    cy.get('input[name="password"]').type(user.password);
    cy.get('button[type="submit"]').click();
    cy.get('.feedback.success', { timeout: 10000 }).should('contain', 'Conta criada e sessao iniciada com sucesso.');
    cy.get('.welcome-chip').should('contain', user.name);
    cy.get('h1').should('contain', 'Painel de reservas');
  });

  it('deve exibir erro ao tentar criar conta sem preencher campos obrigatorios', () => {
    cy.get('.auth-tabs button').contains('Criar conta').click();
    cy.get('input[name="name"]').focus().blur();
    cy.get('button[type="submit"]').click();

    cy.get('input[name="name"]').then(($input) => {
      expect($input[0].validationMessage).to.not.be.empty;
    });
  });

  it('deve permitir fazer login com usuario existente e acessar o painel', () => {
    const user = createUniqueUserPayload('web-login');
    cy.apiRegister(user).then(() => {
      cy.guiLogin(user);
    });
  });

  it('deve exibir erro ao tentar fazer login com credenciais invalidas', () => {
    const user = createUniqueUserPayload('web-login-invalid');
    cy.apiRegister(user).then(() => {
      cy.get('.auth-tabs button').contains('Entrar').click();
      cy.get('input[name="email"]').type(user.email);
      cy.get('input[name="password"]').type('SenhaErrada123');
      cy.get('button[type="submit"]').click();

      cy.get('.feedback.error').should('contain', 'Credenciais invalidas.');
    });
  });

  it('deve permitir fazer logout e retornar para a tela de autenticacao', () => {
    const user = createUniqueUserPayload('web-logout');
    cy.apiRegister(user).then(() => {
      cy.guiLogin(user);
      cy.get('.topbar-actions button').contains('Sair').click();

      cy.get('.auth-panel').should('be.visible');
      cy.get('.hero-panel').should('be.visible');
    });
  });
});
