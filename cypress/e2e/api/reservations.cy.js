const {
  createUniqueUserPayload,
  expectReservationContract,
  getDateWithOffset,
  getTodayString,
  minutesToTimeString,
} = require('../../support/api-helpers');

const createReservation = ({ token, body, failOnStatusCode = true }) => {
  return cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}/api/reservations`,
    failOnStatusCode,
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body,
  });
};

describe('API Reservations - /api/reservations e /api/reservations/my', () => {
  it('deve retornar 401 ao criar reserva sem token', () => {
    cy.request({
      method: 'POST',
      url: `${Cypress.env('apiUrl')}/api/reservations`,
      failOnStatusCode: false,
      body: {
        deskId: 1,
        date: getDateWithOffset(1),
        startTime: '09:00',
        endTime: '10:00',
      },
    }).then((response) => {
      expect(response.status).to.eq(401);
      expect(response.body.message).to.eq('Token de acesso nao informado.');
    });
  });

  it('deve criar uma reserva com sucesso e validar o contrato da resposta', () => {
    const user = createUniqueUserPayload('reservation-success');
    const reservationDate = getDateWithOffset(2);

    cy.apiRegister(user).then((registerResponse) => {
      createReservation({
        token: registerResponse.body.token,
        body: {
          deskId: 3,
          date: reservationDate,
          startTime: '09:00',
          endTime: '11:00',
        },
      }).then((response) => {
        expect(response.status).to.eq(201);
        expect(response.body.message).to.eq('Reserva criada com sucesso.');
        expectReservationContract(response.body.reservation);
        expect(response.body.reservation.userName).to.eq(user.name);
        expect(response.body.reservation.deskId).to.eq(3);
      });
    });
  });

  it('deve retornar 400 quando faltarem campos obrigatorios', () => {
    const user = createUniqueUserPayload('reservation-required-fields');

    cy.apiRegister(user).then((registerResponse) => {
      createReservation({
        token: registerResponse.body.token,
        failOnStatusCode: false,
        body: {
          deskId: 3,
          date: getDateWithOffset(2),
          startTime: '09:00',
        },
      }).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body.message).to.eq(
          'Mesa, data, horario inicial e horario final sao obrigatorios.',
        );
      });
    });
  });

  it('deve retornar 404 quando a mesa nao existir', () => {
    const user = createUniqueUserPayload('reservation-invalid-desk');

    cy.apiRegister(user).then((registerResponse) => {
      createReservation({
        token: registerResponse.body.token,
        failOnStatusCode: false,
        body: {
          deskId: 999,
          date: getDateWithOffset(2),
          startTime: '09:00',
          endTime: '10:00',
        },
      }).then((response) => {
        expect(response.status).to.eq(404);
        expect(response.body.message).to.eq('Mesa nao encontrada.');
      });
    });
  });

  it('deve retornar 400 quando a data for invalida', () => {
    const user = createUniqueUserPayload('reservation-invalid-date');

    cy.apiRegister(user).then((registerResponse) => {
      createReservation({
        token: registerResponse.body.token,
        failOnStatusCode: false,
        body: {
          deskId: 3,
          date: '2026-99-99',
          startTime: '09:00',
          endTime: '10:00',
        },
      }).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body.message).to.eq('A data informada e invalida.');
      });
    });
  });

  it('deve retornar 400 quando o horario estiver em formato invalido', () => {
    const user = createUniqueUserPayload('reservation-invalid-time-format');

    cy.apiRegister(user).then((registerResponse) => {
      createReservation({
        token: registerResponse.body.token,
        failOnStatusCode: false,
        body: {
          deskId: 3,
          date: getDateWithOffset(2),
          startTime: '9h',
          endTime: '10:00',
        },
      }).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body.message).to.eq('Os horarios devem estar no formato HH:MM.');
      });
    });
  });

  it('deve retornar 400 quando o horario final for menor que o inicial', () => {
    const user = createUniqueUserPayload('reservation-invalid-range');

    cy.apiRegister(user).then((registerResponse) => {
      createReservation({
        token: registerResponse.body.token,
        failOnStatusCode: false,
        body: {
          deskId: 4,
          date: getDateWithOffset(2),
          startTime: '15:00',
          endTime: '10:00',
        },
      }).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body.message).to.eq(
          'O horario final precisa ser maior do que o horario inicial.',
        );
      });
    });
  });

  it('Nao deve aceitar reserva em data passada', () => {
    const user = createUniqueUserPayload('reservation-past-date');
    const pastDate = getDateWithOffset(-1);

    cy.apiRegister(user).then((registerResponse) => {
      createReservation({
        token: registerResponse.body.token,
        failOnStatusCode: false,
        body: {
          deskId: 13,
          date: pastDate,
          startTime: '09:00',
          endTime: '10:00',
        },
      }).then((response) => {
        // Regra de negocio violada: Nao e permitido criar reservas com datas no passado.
        expect(response.status).to.eq(400);
      });
    });
  });

  it('deve retornar 400 quando a reserva estiver fora da faixa permitida', () => {
    const user = createUniqueUserPayload('reservation-hours');

    cy.apiRegister(user).then((registerResponse) => {
      createReservation({
        token: registerResponse.body.token,
        failOnStatusCode: false,
        body: {
          deskId: 5,
          date: getDateWithOffset(2),
          startTime: '07:00',
          endTime: '09:00',
        },
      }).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body.message).to.eq(
          'As reservas so podem acontecer entre 08:00 e 18:00.',
        );
      });
    });
  });

  it('deve retornar 400 quando a reserva ultrapassar a duracao maxima', () => {
    const user = createUniqueUserPayload('reservation-max-duration');

    cy.apiRegister(user).then((registerResponse) => {
      createReservation({
        token: registerResponse.body.token,
        failOnStatusCode: false,
        body: {
          deskId: 6,
          date: getDateWithOffset(2),
          startTime: '08:00',
          endTime: '18:00',
        },
      }).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body.message).to.eq(
          'Uma reserva nao pode ultrapassar 9 horas de duracao.',
        );
      });
    });
  });

  it('deve retornar 409 quando houver conflito de horario para a mesma mesa', () => {
    const firstUser = createUniqueUserPayload('reservation-conflict-a');
    const secondUser = createUniqueUserPayload('reservation-conflict-b');
    const reservationDate = getDateWithOffset(3);

    cy.apiRegister(firstUser).then((firstRegisterResponse) => {
      return createReservation({
        token: firstRegisterResponse.body.token,
        body: {
          deskId: 8,
          date: reservationDate,
          startTime: '10:00',
          endTime: '12:00',
        },
      }).then(() => {
        cy.apiRegister(secondUser).then((secondRegisterResponse) => {
          createReservation({
            token: secondRegisterResponse.body.token,
            failOnStatusCode: false,
            body: {
              deskId: 8,
              date: reservationDate,
              startTime: '10:30',
              endTime: '11:30',
            },
          }).then((response) => {
            expect(response.status).to.eq(409);
            expect(response.body.message).to.eq(
              'Ja existe uma reserva para esta mesa no periodo informado.',
            );
          });
        });
      });
    });
  });

  it('Nao deve aceitar reserva com sobreposicao de exatamente 1 minuto', () => {
    const firstUser = createUniqueUserPayload('reservation-overlap-minute-a');
    const secondUser = createUniqueUserPayload('reservation-overlap-minute-b');
    const reservationDate = getDateWithOffset(8);

    cy.apiRegister(firstUser).then((firstRegisterResponse) => {
      return createReservation({
        token: firstRegisterResponse.body.token,
        body: {
          deskId: 14,
          date: reservationDate,
          startTime: '10:00',
          endTime: '11:00',
        },
      }).then(() => {
        cy.apiRegister(secondUser).then((secondRegisterResponse) => {
          createReservation({
            token: secondRegisterResponse.body.token,
            failOnStatusCode: false,
            body: {
              deskId: 14,
              date: reservationDate,
              startTime: '10:59',
              endTime: '12:00',
            },
          }).then((response) => {
            // Regra de negocio violada: Nao pode haver nenhuma sobreposicao de horarios para a mesma mesa.
            expect(response.status).to.eq(409);
          });
        });
      });
    });
  });

  it('Nao deve permitir uma terceira reserva no mesmo dia', () => {
    const user = createUniqueUserPayload('reservation-daily-limit');
    const reservationDate = getDateWithOffset(9);

    cy.apiRegister(user).then((registerResponse) => {
      const token = registerResponse.body.token;

      createReservation({
        token,
        body: {
          deskId: 15,
          date: reservationDate,
          startTime: '08:00',
          endTime: '09:00',
        },
      })
        .then(() =>
          createReservation({
            token,
            body: {
              deskId: 16,
              date: reservationDate,
              startTime: '10:00',
              endTime: '11:00',
            },
          }),
        )
        .then(() =>
          createReservation({
            token,
            failOnStatusCode: false,
            body: {
              deskId: 17,
              date: reservationDate,
              startTime: '12:00',
              endTime: '13:00',
            },
          }),
        )
        .then((response) => {
          // Regra de negocio violada: Cada colaborador pode ter no maximo 2 reservas por dia.
          expect(response.status).to.eq(400);
        });
    });
  });

  it('deve bloquear a quarta reserva no mesmo dia apos o bug do limite diario', () => {
    const user = createUniqueUserPayload('reservation-daily-limit-fourth');
    const reservationDate = getDateWithOffset(10);

    cy.apiRegister(user).then((registerResponse) => {
      const token = registerResponse.body.token;

      createReservation({
        token,
        body: {
          deskId: 1,
          date: reservationDate,
          startTime: '08:00',
          endTime: '09:00',
        },
      })
        .then(() =>
          createReservation({
            token,
            body: {
              deskId: 2,
              date: reservationDate,
              startTime: '10:00',
              endTime: '11:00',
            },
          }),
        )
        .then(() =>
          createReservation({
            token,
            body: {
              deskId: 3,
              date: reservationDate,
              startTime: '12:00',
              endTime: '13:00',
            },
          }),
        )
        .then(() =>
          createReservation({
            token,
            failOnStatusCode: false,
            body: {
              deskId: 4,
              date: reservationDate,
              startTime: '14:00',
              endTime: '15:00',
            },
          }),
        )
        .then((response) => {
          expect(response.status).to.eq(400);
          expect(response.body.message).to.eq(
            'Cada colaborador pode ter no maximo 2 reservas por dia.',
          );
        });
    });
  });

  it('deve listar todas as reservas do usuario quando a data nao for informada', () => {
    const user = createUniqueUserPayload('reservation-list-all');

    cy.apiRegister(user).then((registerResponse) => {
      const token = registerResponse.body.token;

      createReservation({
        token,
        body: {
          deskId: 5,
          date: getDateWithOffset(11),
          startTime: '09:00',
          endTime: '10:00',
        },
      })
        .then(() =>
          createReservation({
            token,
            body: {
              deskId: 6,
              date: getDateWithOffset(12),
              startTime: '11:00',
              endTime: '12:00',
            },
          }),
        )
        .then(() => {
          cy.request({
            method: 'GET',
            url: `${Cypress.env('apiUrl')}/api/reservations/my`,
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }).then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body.reservations).to.be.an('array');
            expect(response.body.reservations.length).to.be.greaterThan(1);
            response.body.reservations.forEach(expectReservationContract);
          });
        });
    });
  });

  it('deve retornar 400 ao listar reservas com data invalida', () => {
    const user = createUniqueUserPayload('reservation-list-invalid-date');

    cy.apiRegister(user).then((registerResponse) => {
      cy.request({
        method: 'GET',
        url: `${Cypress.env('apiUrl')}/api/reservations/my?date=2026-88-99`,
        failOnStatusCode: false,
        headers: {
          Authorization: `Bearer ${registerResponse.body.token}`,
        },
      }).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body.message).to.eq('A data informada e invalida.');
      });
    });
  });

  it('deve retornar 401 ao listar reservas sem autenticacao', () => {
    cy.request({
      method: 'GET',
      url: `${Cypress.env('apiUrl')}/api/reservations/my`,
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(401);
      expect(response.body.message).to.eq('Token de acesso nao informado.');
    });
  });

  it('Nao deve permitir reserva no mesmo dia com antecedencia insuficiente', () => {
    const user = createUniqueUserPayload('reservation-lead-time');
    const now = new Date();
    const currentMinutes = now.getMinutes();
    const targetStartMinutes = now.getHours() * 60 + 60;
    const targetEndMinutes = targetStartMinutes + 60;
    const sameDay = getTodayString();

    if (currentMinutes === 0 || targetStartMinutes < 8 * 60 || targetEndMinutes > 18 * 60) {
      cy.log('Cenario de bug de antecedencia nao aplicavel para o horario atual.');
      return;
    }

    cy.apiRegister(user).then((registerResponse) => {
      createReservation({
        token: registerResponse.body.token,
        failOnStatusCode: false,
        body: {
          deskId: 18,
          date: sameDay,
          startTime: minutesToTimeString(targetStartMinutes),
          endTime: minutesToTimeString(targetEndMinutes),
        },
      }).then((response) => {
        // Regra de negocio violada: Reservas para hoje exigem pelo menos 1 hora de antecedencia completa (incluindo os minutos).
        expect(response.status).to.eq(400);
      });
    });
  });

  it('deve listar as reservas do usuario autenticado com contrato valido', () => {
    const user = createUniqueUserPayload('reservation-list');
    const reservationDate = getDateWithOffset(4);

    cy.apiRegister(user).then((registerResponse) => {
      createReservation({
        token: registerResponse.body.token,
        body: {
          deskId: 9,
          date: reservationDate,
          startTime: '13:00',
          endTime: '15:00',
        },
      }).then(() => {
        cy.request({
          method: 'GET',
          url: `${Cypress.env('apiUrl')}/api/reservations/my?date=${reservationDate}`,
          headers: {
            Authorization: `Bearer ${registerResponse.body.token}`,
          },
        }).then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body).to.have.property('reservations');
          expect(response.body.reservations).to.be.an('array').and.have.length(1);
          response.body.reservations.forEach(expectReservationContract);
        });
      });
    });
  });

  it('deve remover uma reserva propria com sucesso', () => {
    const user = createUniqueUserPayload('reservation-delete');
    const reservationDate = getDateWithOffset(5);

    cy.apiRegister(user).then((registerResponse) => {
      createReservation({
        token: registerResponse.body.token,
        body: {
          deskId: 10,
          date: reservationDate,
          startTime: '09:00',
          endTime: '10:00',
        },
      }).then((createResponse) => {
        cy.request({
          method: 'DELETE',
          url: `${Cypress.env('apiUrl')}/api/reservations/${createResponse.body.reservation.id}`,
          headers: {
            Authorization: `Bearer ${registerResponse.body.token}`,
          },
        }).then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body.message).to.eq('Reserva removida com sucesso.');
        });
      });
    });
  });

  it('deve retornar 403 ao tentar remover reserva de outro usuario', () => {
    const ownerUser = createUniqueUserPayload('reservation-owner');
    const anotherUser = createUniqueUserPayload('reservation-other-user');
    const reservationDate = getDateWithOffset(6);

    cy.apiRegister(ownerUser).then((ownerRegisterResponse) => {
      createReservation({
        token: ownerRegisterResponse.body.token,
        body: {
          deskId: 11,
          date: reservationDate,
          startTime: '11:00',
          endTime: '12:00',
        },
      }).then((createResponse) => {
        cy.apiRegister(anotherUser).then((anotherRegisterResponse) => {
          cy.request({
            method: 'DELETE',
            url: `${Cypress.env('apiUrl')}/api/reservations/${createResponse.body.reservation.id}`,
            failOnStatusCode: false,
            headers: {
              Authorization: `Bearer ${anotherRegisterResponse.body.token}`,
            },
          }).then((response) => {
            expect(response.status).to.eq(403);
            expect(response.body.message).to.eq(
              'Voce so pode cancelar reservas criadas pelo proprio usuario.',
            );
          });
        });
      });
    });
  });

  it('deve retornar 404 ao tentar remover uma reserva inexistente', () => {
    const user = createUniqueUserPayload('reservation-not-found');

    cy.apiRegister(user).then((registerResponse) => {
      cy.request({
        method: 'DELETE',
        url: `${Cypress.env('apiUrl')}/api/reservations/999999`,
        failOnStatusCode: false,
        headers: {
          Authorization: `Bearer ${registerResponse.body.token}`,
        },
      }).then((response) => {
        expect(response.status).to.eq(404);
        expect(response.body.message).to.eq('Reserva nao encontrada.');
      });
    });
  });

  it('deve retornar 400 ao tentar remover com identificador invalido', () => {
    const user = createUniqueUserPayload('reservation-invalid-id');

    cy.apiRegister(user).then((registerResponse) => {
      cy.request({
        method: 'DELETE',
        url: `${Cypress.env('apiUrl')}/api/reservations/abc`,
        failOnStatusCode: false,
        headers: {
          Authorization: `Bearer ${registerResponse.body.token}`,
        },
      }).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body.message).to.eq('O identificador da reserva e invalido.');
      });
    });
  });
});
