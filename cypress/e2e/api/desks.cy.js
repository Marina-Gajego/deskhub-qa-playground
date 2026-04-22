const {
  createUniqueUserPayload,
  expectDeskContract,
  getDateWithOffset,
} = require('../../support/api-helpers');

describe('API Desks - GET /api/desks', () => {
  it('deve retornar 401 quando consultar mesas sem autenticacao', () => {
    cy.request({
      method: 'GET',
      url: `${Cypress.env('apiUrl')}/api/desks?date=${getDateWithOffset(1)}`,
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(401);
      expect(response.body.message).to.eq('Token de acesso nao informado.');
    });
  });

  it('deve retornar 400 quando a data for invalida', () => {
    const user = createUniqueUserPayload('desks-invalid-date');

    cy.apiRegister(user).then((registerResponse) => {
      cy.request({
        method: 'GET',
        url: `${Cypress.env('apiUrl')}/api/desks?date=2026-99-99`,
        failOnStatusCode: false,
        headers: {
          Authorization: `Bearer ${registerResponse.body.token}`,
        },
      }).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body.message).to.eq(
          'Informe uma data valida no formato YYYY-MM-DD.',
        );
      });
    });
  });

  it('deve retornar 400 quando a data nao for enviada', () => {
    const user = createUniqueUserPayload('desks-missing-date');

    cy.apiRegister(user).then((registerResponse) => {
      cy.request({
        method: 'GET',
        url: `${Cypress.env('apiUrl')}/api/desks`,
        failOnStatusCode: false,
        headers: {
          Authorization: `Bearer ${registerResponse.body.token}`,
        },
      }).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body.message).to.eq(
          'Informe uma data valida no formato YYYY-MM-DD.',
        );
      });
    });
  });

  it('deve retornar 401 quando o token for invalido', () => {
    cy.request({
      method: 'GET',
      url: `${Cypress.env('apiUrl')}/api/desks?date=${getDateWithOffset(1)}`,
      failOnStatusCode: false,
      headers: {
        Authorization: 'Bearer token-invalido',
      },
    }).then((response) => {
      expect(response.status).to.eq(401);
      expect(response.body.message).to.eq('Token invalido ou expirado.');
    });
  });

  it('deve listar as mesas da data informada com contrato valido', () => {
    const user = createUniqueUserPayload('desks-success');
    const reservationDate = getDateWithOffset(2);

    cy.apiRegister(user).then((registerResponse) => {
      cy.request({
        method: 'GET',
        url: `${Cypress.env('apiUrl')}/api/desks?date=${reservationDate}`,
        headers: {
          Authorization: `Bearer ${registerResponse.body.token}`,
        },
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('desks');
        expect(response.body.desks).to.be.an('array').and.have.length(20);
        response.body.desks.forEach(expectDeskContract);
      });
    });
  });

  it('deve refletir mesa reservada ao consultar a data apos criar uma reserva', () => {
    const user = createUniqueUserPayload('desks-reserved-status');
    const reservationDate = getDateWithOffset(7);

    cy.apiRegister(user).then((registerResponse) => {
      cy.request({
        method: 'POST',
        url: `${Cypress.env('apiUrl')}/api/reservations`,
        headers: {
          Authorization: `Bearer ${registerResponse.body.token}`,
        },
        body: {
          deskId: 12,
          date: reservationDate,
          startTime: '14:00',
          endTime: '16:00',
        },
      }).then(() => {
        cy.request({
          method: 'GET',
          url: `${Cypress.env('apiUrl')}/api/desks?date=${reservationDate}`,
          headers: {
            Authorization: `Bearer ${registerResponse.body.token}`,
          },
        }).then((response) => {
          expect(response.status).to.eq(200);
          const reservedDesk = response.body.desks.find((desk) => desk.id === 12);

          expect(reservedDesk).to.exist;
          expectDeskContract(reservedDesk);
          expect(reservedDesk.status).to.eq('reservada');
          expect(reservedDesk.reservations).to.have.length(1);
          expect(reservedDesk.reservations[0].startTime).to.eq('14:00');
          expect(reservedDesk.reservations[0].endTime).to.eq('16:00');
        });
      });
    });
  });
});
