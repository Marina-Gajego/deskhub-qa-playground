const { createUniqueUserPayload, getDateWithOffset } = require('../../support/api-helpers');

describe('E2E Web - Meu Perfil', () => {
  let user;
  let randomDeskId;

  beforeEach(() => {
    user = createUniqueUserPayload('web-profile');
    randomDeskId = Math.floor(Math.random() * 20) + 1;
    const futureDate = getDateWithOffset(Math.floor(Math.random() * 10) + 5);

    cy.apiRegister(user).then((res) => {
      cy.sessionLogin(user);
      
      // Criar uma reserva inicial via API para testar a listagem
      cy.request({
        method: 'POST',
        url: `${Cypress.env('apiUrl')}/api/reservations`,
        headers: { Authorization: `Bearer ${res.body.token}` },
        body: {
          deskId: randomDeskId,
          date: futureDate,
          startTime: '10:00',
          endTime: '12:00',
        },
      });

      cy.visit('/');
      cy.get('.view-switcher button').contains('Meu perfil').click();
    });
  });

  it('deve exibir os dados corretos do usuario logado', () => {
    cy.get('.profile-summary').within(() => {
      cy.get('.profile-tile').contains(user.name);
      cy.get('.profile-tile').contains(user.email);
    });
  });

  it('deve listar as reservas do usuario', () => {
    cy.get('.reservation-list-card').within(() => {
      cy.get('.reservation-row').should('have.length', 1);
      cy.get('.reservation-row').contains(`Mesa ${randomDeskId}`);
      cy.get('.reservation-row').contains('10:00 - 12:00');
    });
  });

  it('deve permitir deletar uma reserva e exibir estado vazio caso não tenha mais reservas', () => {
    // Interceptar o confirm window
    cy.on('window:confirm', () => true);

    cy.get('.reservation-row').first().within(() => {
      cy.get('button').contains('Remover').click();
    });

    cy.get('.feedback.success').should('contain', 'Reserva removida com sucesso.');
    
    // Verificar que a lista ficou vazia
    cy.get('.reservation-list-card').within(() => {
      cy.get('.empty-state').should('contain', 'Voce ainda nao tem reservas cadastradas.');
    });
  });
});
