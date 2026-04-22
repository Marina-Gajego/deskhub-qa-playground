Cypress.Commands.add('apiRegister', (userPayload) => {
  return cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}/api/auth/register`,
    body: userPayload,
  });
});

Cypress.Commands.add('apiLogin', (credentials) => {
  return cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}/api/auth/login`,
    body: credentials,
  });
});

Cypress.Commands.add('guiLogin', (user) => {
  cy.visit('/');
  cy.get('.auth-tabs button').contains('Entrar').click();
  cy.get('input[name="email"]').type(user.email);
  cy.get('input[name="password"]').type(user.password);
  cy.get('button[type="submit"]').click();
  cy.get('.welcome-chip').should('contain', user.name);
});

Cypress.Commands.add('sessionLogin', (user) => {
  cy.apiLogin({ email: user.email, password: user.password }).then((response) => {
    window.localStorage.setItem('deskhub_token', response.body.token);
    window.localStorage.setItem('deskhub_user', JSON.stringify(response.body.user));
  });
});
