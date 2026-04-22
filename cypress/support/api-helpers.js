const createUniqueUserPayload = (prefix = 'api-user', overrides = {}) => {
  const uniqueSuffix = `${Date.now()}-${Cypress._.random(1000, 9999)}`;

  return {
    name: `QA ${prefix} ${uniqueSuffix}`,
    email: `${prefix}-${uniqueSuffix}@qa.local`,
    password: 'DeskHub@123',
    ...overrides,
  };
};

const getDateWithOffset = (offsetInDays = 1) => {
  const currentDate = new Date();
  currentDate.setDate(currentDate.getDate() + offsetInDays);

  const timezoneOffset = currentDate.getTimezoneOffset() * 60 * 1000;
  return new Date(currentDate.getTime() - timezoneOffset).toISOString().slice(0, 10);
};

const getTodayString = () => getDateWithOffset(0);

const minutesToTimeString = (totalMinutes) => {
  const normalizedMinutes = ((totalMinutes % 1440) + 1440) % 1440;
  const hours = String(Math.floor(normalizedMinutes / 60)).padStart(2, '0');
  const minutes = String(normalizedMinutes % 60).padStart(2, '0');

  return `${hours}:${minutes}`;
};

const expectUserContract = (user) => {
  expect(user).to.include.keys('id', 'name', 'email');
  expect(user.id).to.be.a('number');
  expect(user.name).to.be.a('string');
  expect(user.email).to.be.a('string');
};

const expectAuthSuccessContract = (body) => {
  expect(body).to.include.keys('message', 'token', 'user');
  expect(body.message).to.be.a('string');
  expect(body.token).to.be.a('string').and.not.be.empty;
  expectUserContract(body.user);
};

const expectReservationContract = (reservation) => {
  expect(reservation).to.include.keys(
    'id',
    'deskId',
    'userId',
    'date',
    'startTime',
    'endTime',
  );
  expect(reservation.id).to.be.a('number');
  expect(reservation.deskId).to.be.a('number');
  expect(reservation.userId).to.be.a('number');
  expect(reservation.date).to.be.a('string');
  expect(reservation.startTime).to.be.a('string');
  expect(reservation.endTime).to.be.a('string');

  if (Object.prototype.hasOwnProperty.call(reservation, 'userName')) {
    expect(reservation.userName).to.be.a('string');
  }
};

const expectDeskContract = (desk) => {
  expect(desk).to.include.keys('id', 'number', 'zone', 'status', 'reservations');
  expect(desk.id).to.be.a('number');
  expect(desk.number).to.be.a('number');
  expect(desk.zone).to.be.a('string');
  expect(desk.status).to.be.oneOf(['livre', 'reservada']);
  expect(desk.reservations).to.be.an('array');
  desk.reservations.forEach(expectReservationContract);
};

module.exports = {
  createUniqueUserPayload,
  expectAuthSuccessContract,
  expectDeskContract,
  expectReservationContract,
  expectUserContract,
  getDateWithOffset,
  getTodayString,
  minutesToTimeString,
};
