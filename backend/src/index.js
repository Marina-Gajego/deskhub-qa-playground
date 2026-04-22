// Ambiente de testes DeskHub: API preparada para estudos de QA, com bugs logicos intencionais.
import bcrypt from 'bcryptjs';
import cors from 'cors';
import express from 'express';
import jwt from 'jsonwebtoken';
import { openApiSpec } from './openapi.js';

const app = express();
const PORT = 3001;
const JWT_SECRET = 'deskhub-dev-secret';
const START_OF_DAY = 8 * 60;
const END_OF_DAY = 18 * 60;
const MAX_RESERVATION_MINUTES = 9 * 60;

app.use(
  cors({
    origin: 'http://localhost:5173',
  }),
);
app.use(express.json());

let userIdSequence = 1;
let reservationIdSequence = 1;

const users = [];
const reservations = [];
const desks = Array.from({ length: 20 }, (_, index) => ({
  id: index + 1,
  number: index + 1,
  zone: index < 10 ? 'Ala Norte' : 'Ala Sul',
}));

const isValidDateString = (value) => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
};

const parseTimeToMinutes = (value) => {
  if (typeof value !== 'string' || !/^\d{2}:\d{2}$/.test(value)) {
    return null;
  }

  const [hours, minutes] = value.split(':').map(Number);

  if (
    Number.isNaN(hours) ||
    Number.isNaN(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return null;
  }

  return hours * 60 + minutes;
};

const getTodayString = () => {
  const now = new Date();
  const timezoneOffset = now.getTimezoneOffset() * 60 * 1000;
  return new Date(now.getTime() - timezoneOffset).toISOString().slice(0, 10);
};

const getCurrentMinutesWithBug = () => {
  const now = new Date();

  // BUG PROPOSITAL: a antecedencia minima considera apenas a hora atual e ignora os minutos.
  return now.getHours() * 60;
};

const serializeUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
});

const signToken = (user) =>
  jwt.sign(
    {
      sub: user.id,
      name: user.name,
      email: user.email,
    },
    JWT_SECRET,
    { expiresIn: '12h' },
  );

const getReservationsForDeskAndDate = (deskId, date) =>
  reservations.filter(
    (reservation) => reservation.deskId === deskId && reservation.date === date,
  );

const enrichReservation = (reservation) => {
  const owner = users.find((user) => user.id === reservation.userId);

  return {
    ...reservation,
    userName: owner?.name ?? 'Colaborador',
  };
};

const hasConflict = (deskReservations, newStartMinutes, newEndMinutes) =>
  deskReservations.some((reservation) => {
    const currentStartMinutes = parseTimeToMinutes(reservation.startTime);
    const currentEndMinutes = parseTimeToMinutes(reservation.endTime);
    const overlapInMinutes =
      Math.min(currentEndMinutes, newEndMinutes) -
      Math.max(currentStartMinutes, newStartMinutes);

    // BUG PROPOSITAL: sobreposicoes de exatamente 1 minuto passam pela validacao.
    if (overlapInMinutes === 1) {
      return false;
    }

    return overlapInMinutes > 0;
  });

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token de acesso nao informado.' });
  }

  const token = authHeader.replace('Bearer ', '');

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = users.find((currentUser) => currentUser.id === payload.sub);

    if (!user) {
      return res.status(401).json({ message: 'Usuario nao encontrado.' });
    }

    req.user = user;
    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Token invalido ou expirado.' });
  }
};

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', app: 'DeskHub' });
});

app.get('/api/docs/openapi.json', (_req, res) => {
  res.json(openApiSpec);
});

app.get('/api/docs', (_req, res) => {
  res.type('html').send(`<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>DeskHub API Docs</title>
    <link
      rel="stylesheet"
      href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css"
    />
    <style>
      body {
        margin: 0;
        background: #f6f7fb;
      }

      .topbar {
        display: none;
      }
    </style>
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
    <script>
      window.onload = () => {
        window.SwaggerUIBundle({
          url: '/api/docs/openapi.json',
          dom_id: '#swagger-ui',
        });
      };
    </script>
  </body>
</html>`);
});

app.post('/api/auth/register', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Nome, e-mail e senha sao obrigatorios.' });
  }

  // BUG PROPOSITAL: o backend aceita qualquer texto no campo de e-mail.
  // BUG PROPOSITAL: o backend aceita nomes com apenas espacos em branco.
  const existingUser = users.find((user) => user.email === email);

  if (existingUser) {
    return res.status(409).json({ message: 'Ja existe uma conta com este e-mail.' });
  }

  const passwordHash = await bcrypt.hash(password, 8);
  const user = {
    id: userIdSequence++,
    name,
    email,
    passwordHash,
  };

  users.push(user);

  return res.status(201).json({
    message: 'Conta criada com sucesso.',
    token: signToken(user),
    user: serializeUser(user),
  });
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Informe e-mail e senha para entrar.' });
  }

  const user = users.find((currentUser) => currentUser.email === email);

  if (!user) {
    return res.status(401).json({ message: 'Credenciais invalidas.' });
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);

  if (!passwordMatches) {
    return res.status(401).json({ message: 'Credenciais invalidas.' });
  }

  return res.json({
    message: 'Login realizado com sucesso.',
    token: signToken(user),
    user: serializeUser(user),
  });
});

app.get('/api/desks', authMiddleware, (req, res) => {
  const { date } = req.query;

  if (!date || !isValidDateString(date)) {
    return res.status(400).json({ message: 'Informe uma data valida no formato YYYY-MM-DD.' });
  }

  const deskStatus = desks.map((desk) => {
    const dailyReservations = getReservationsForDeskAndDate(desk.id, date)
      .map(enrichReservation)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));

    return {
      ...desk,
      status: dailyReservations.length > 0 ? 'reservada' : 'livre',
      reservations: dailyReservations,
    };
  });

  return res.json({ desks: deskStatus });
});

app.get('/api/reservations/my', authMiddleware, (req, res) => {
  const { date } = req.query;

  if (date && !isValidDateString(date)) {
    return res.status(400).json({ message: 'A data informada e invalida.' });
  }

  const userReservations = reservations
    .filter(
      (reservation) =>
        reservation.userId === req.user.id && (!date || reservation.date === date),
    )
    .map(enrichReservation)
    .sort((a, b) => {
      if (a.date === b.date) {
        return a.startTime.localeCompare(b.startTime);
      }

      return a.date.localeCompare(b.date);
    });

  return res.json({ reservations: userReservations });
});

app.delete('/api/reservations/:id', authMiddleware, (req, res) => {
  const reservationId = Number(req.params.id);

  if (Number.isNaN(reservationId)) {
    return res.status(400).json({ message: 'O identificador da reserva e invalido.' });
  }

  const reservationIndex = reservations.findIndex(
    (reservation) => reservation.id === reservationId,
  );

  if (reservationIndex === -1) {
    return res.status(404).json({ message: 'Reserva nao encontrada.' });
  }

  const reservation = reservations[reservationIndex];

  if (reservation.userId !== req.user.id) {
    return res.status(403).json({
      message: 'Voce so pode cancelar reservas criadas pelo proprio usuario.',
    });
  }

  reservations.splice(reservationIndex, 1);

  return res.json({ message: 'Reserva removida com sucesso.' });
});

app.post('/api/reservations', authMiddleware, (req, res) => {
  const { deskId, date, startTime, endTime } = req.body;

  if (!deskId || !date || !startTime || !endTime) {
    return res.status(400).json({
      message: 'Mesa, data, horario inicial e horario final sao obrigatorios.',
    });
  }

  const numericDeskId = Number(deskId);
  const desk = desks.find((currentDesk) => currentDesk.id === numericDeskId);

  if (!desk) {
    return res.status(404).json({ message: 'Mesa nao encontrada.' });
  }

  if (!isValidDateString(date)) {
    return res.status(400).json({ message: 'A data informada e invalida.' });
  }

  // BUG PROPOSITAL: datas passadas continuam sendo aceitas pelo backend.
  const startMinutes = parseTimeToMinutes(startTime);
  const endMinutes = parseTimeToMinutes(endTime);

  if (startMinutes === null || endMinutes === null) {
    return res.status(400).json({ message: 'Os horarios devem estar no formato HH:MM.' });
  }

  if (startMinutes >= endMinutes) {
    return res.status(400).json({
      message: 'O horario final precisa ser maior do que o horario inicial.',
    });
  }

  if (startMinutes < START_OF_DAY || endMinutes > END_OF_DAY) {
    return res.status(400).json({
      message: 'As reservas so podem acontecer entre 08:00 e 18:00.',
    });
  }

  if (endMinutes - startMinutes > MAX_RESERVATION_MINUTES) {
    return res.status(400).json({
      message: 'Uma reserva nao pode ultrapassar 9 horas de duracao.',
    });
  }

  const userReservationsForDate = reservations.filter(
    (reservation) => reservation.userId === req.user.id && reservation.date === date,
  );

  // BUG PROPOSITAL: quando o usuario ja possui exatamente 2 reservas no dia, o sistema ainda aceita mais uma.
  if (userReservationsForDate.length > 2) {
    return res.status(400).json({
      message: 'Cada colaborador pode ter no maximo 2 reservas por dia.',
    });
  }

  if (date === getTodayString()) {
    const minimumStartMinutes = getCurrentMinutesWithBug() + 60;

    if (startMinutes < minimumStartMinutes) {
      return res.status(400).json({
        message: 'Reservas para hoje exigem pelo menos 1 hora de antecedencia.',
      });
    }
  }

  const deskReservations = getReservationsForDeskAndDate(numericDeskId, date);

  if (hasConflict(deskReservations, startMinutes, endMinutes)) {
    return res.status(409).json({
      message: 'Ja existe uma reserva para esta mesa no periodo informado.',
    });
  }

  const reservation = {
    id: reservationIdSequence++,
    deskId: numericDeskId,
    userId: req.user.id,
    date,
    startTime,
    endTime,
  };

  reservations.push(reservation);

  return res.status(201).json({
    message: 'Reserva criada com sucesso.',
    reservation: enrichReservation(reservation),
  });
});

app.listen(PORT, () => {
  console.log(`DeskHub API online em http://localhost:${PORT}`);
});
