import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 20 }, // ramp-up para 20 usuários
    { duration: '1m', target: 20 },  // mantém 20 usuários por 1 minuto
    { duration: '30s', target: 0 },  // ramp-down para 0
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% das requisições devem ser abaixo de 500ms
    http_req_failed: ['rate<0.01'],   // menos de 1% de falhas
  },
};

const BASE_URL = 'http://localhost:3001/api';

export default function () {
  // 1. Dados únicos do usuário
  const uniqueId = `${__VU}-${__ITER}-${Date.now()}`;
  const userPayload = JSON.stringify({
    name: `K6 User ${uniqueId}`,
    email: `k6-${uniqueId}@test.local`,
    password: 'Password123',
  });

  const baseParams = {
    headers: { 'Content-Type': 'application/json' },
  };

  // 2. Registro
  const registerRes = http.post(`${BASE_URL}/auth/register`, userPayload, baseParams);
  check(registerRes, { 'Registro com sucesso (201)': (r) => r.status === 201 });

  // 3. Login (Teste de CPU por causa do Bcrypt)
  const loginPayload = JSON.stringify({
    email: `k6-${uniqueId}@test.local`,
    password: 'Password123',
  });
  const loginRes = http.post(`${BASE_URL}/auth/login`, loginPayload, baseParams);
  check(loginRes, { 'Login com sucesso (200)': (r) => r.status === 200 });

  if (loginRes.status === 200) {
    const token = loginRes.json().token;
    const authParams = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    };

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 5);
    const targetDate = futureDate.toISOString().slice(0, 10);

    // 4. Consulta de Mesas
    const desksRes = http.get(`${BASE_URL}/desks?date=${targetDate}`, authParams);
    check(desksRes, { 'Consulta de mesas (200)': (r) => r.status === 200 });

    // 5. Criação de Reserva
    const reservationPayload = JSON.stringify({
      deskId: Math.floor(Math.random() * 20) + 1,
      date: targetDate,
      startTime: '09:00',
      endTime: '11:00',
    });
    const reserveRes = http.post(`${BASE_URL}/reservations`, reservationPayload, authParams);
    
    // Aceitamos 201 ou 409 (se a mesa já estiver ocupada no teste de carga)
    check(reserveRes, { 'Reserva criada ou conflito (201/409)': (r) => [201, 409].includes(r.status) });

    let reservationId = null;
    if (reserveRes.status === 201) {
      reservationId = reserveRes.json().reservation.id;
    }

    // 6. Consulta de Minhas Reservas
    const myReservationsRes = http.get(`${BASE_URL}/reservations/my`, authParams);
    check(myReservationsRes, { 'Consulta minhas reservas (200)': (r) => r.status === 200 });

    // 7. Cancelar Reserva (se conseguiu criar)
    if (reservationId) {
      const deleteRes = http.del(`${BASE_URL}/reservations/${reservationId}`, null, authParams);
      check(deleteRes, { 'Reserva cancelada (200)': (r) => r.status === 200 });
    }
  }

  // Pausa simulando o tempo de leitura do usuário
  sleep(1);
}
