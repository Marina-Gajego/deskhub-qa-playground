const { createUniqueUserPayload, getDateWithOffset } = require('../../support/api-helpers');

describe('E2E Web - Dashboard de Mesas e Reservas', () => {
  let user;

  beforeEach(() => {
    user = createUniqueUserPayload('web-dashboard');
    cy.apiRegister(user).then(() => {
      cy.sessionLogin(user);
      cy.visit('/');
    });
  });

  it('deve exibir a listagem de mesas para a data selecionada', () => {
    cy.get('h1').should('contain', 'Painel de reservas');
    cy.get('.pill').should('contain', '20 mesas');
    cy.get('.desk-item').should('have.length', 20);
  });

  it('deve permitir criar uma nova reserva com sucesso', () => {
    // Escolhemos uma mesa e data aleatória para evitar conflitos (409) entre execuções
    const randomDeskId = Math.floor(Math.random() * 20) + 1;
    const futureDate = getDateWithOffset(Math.floor(Math.random() * 10) + 5);
    
    cy.get('input[type="date"]').first().type(futureDate);
    
    cy.get('.reservation-form select[name="deskId"]').select(String(randomDeskId));
    cy.get('.reservation-form input[type="date"]').type(futureDate);
    cy.get('.reservation-form input[name="startTime"]').type('09:00');
    cy.get('.reservation-form input[name="endTime"]').type('12:00');
    cy.get('.reservation-form button[type="submit"]').click();

    cy.get('.feedback.success').should('contain', 'Reserva criada com sucesso.');

    cy.get('.desk-item').contains(`Mesa ${randomDeskId}`).parents('.desk-item').within(() => {
      cy.get('.desk-status').should('contain', 'Reservada no dia');
      cy.get('.slot-chip').should('contain', '09:00 - 12:00');
      cy.get('.slot-chip').should('contain', user.name);
    });
  });

  it('deve exibir erro ao tentar criar reserva violando limite de duracao (regra de negócio)', () => {
    const tomorrow = getDateWithOffset(2);
    
    cy.get('.reservation-form select[name="deskId"]').select('3');
    cy.get('.reservation-form input[type="date"]').type(tomorrow);
    cy.get('.reservation-form input[name="startTime"]').type('08:00', { force: true });
    cy.get('.reservation-form input[name="endTime"]').type('18:00', { force: true }); // 10h de duração > 9h
    cy.get('.reservation-form button[type="submit"]').click();

    cy.get('.feedback.error').should('contain', 'Uma reserva nao pode ultrapassar 9 horas de duracao.');
  });
});
