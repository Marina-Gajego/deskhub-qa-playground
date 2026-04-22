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
