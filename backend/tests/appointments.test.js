const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const Slot = require('../src/models/Slot');

require('dotenv').config({ path: '.env.test' });

let token;
let petId;
let slotId;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI);

  await request(app).post('/api/auth/register').send({
    name: 'Appointment Owner',
    email: 'appointment@furfirst.com',
    password: 'password123'
  });

  const loginRes = await request(app).post('/api/auth/login').send({
    email: 'appointment@furfirst.com',
    password: 'password123'
  });
  token = loginRes.body.token;

  const petRes = await request(app)
    .post('/api/pets')
    .set('Authorization', `Bearer ${token}`)
    .send({ name: 'Whiskers', species: 'cat', breed: 'Persian', age: 2 });
  petId = petRes.body.pet._id;

  const slot = new Slot({
    date: '2025-08-27',
    time: '10:00 AM',
    vetName: 'Dr. Mark',
    isAvailable: true
  });
  const savedSlot = await slot.save();
  slotId = savedSlot._id;
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

describe('Appointment Routes', () => {
  let appointmentId;

  describe('POST /api/appointments', () => {
    it('should book an appointment', async () => {
      const res = await request(app)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${token}`)
        .send({
          petId,
          slotId,
          reason: 'Annual checkup',
          notes: 'First visit'
        });
      expect(res.statusCode).toBe(201);
      expect(res.body.appointment).toBeDefined();
      appointmentId = res.body.appointment._id;
    });
  });

  describe('GET /api/appointments', () => {
    it('should get all appointments', async () => {
      const res = await request(app)
        .get('/api/appointments')
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('DELETE /api/appointments/:id', () => {
    it('should cancel an appointment', async () => {
      const res = await request(app)
        .delete(`/api/appointments/${appointmentId}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toBe(200);
    });
  });
});