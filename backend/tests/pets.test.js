const request = require('supertest');
const mongoose = require('mongoose');

process.env.MONGO_URI = 'mongodb://localhost:27017/furfirst_test_pets';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'xK9mP2qL8nR5vT3wY7zA_furfirst_test_secret_key';
process.env.NODE_ENV = 'test';
process.env.PORT = '5002';

const app = require('../src/app');

let token;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI);

  await request(app).post('/api/auth/register').send({
    name: 'Pet Owner',
    email: 'owner@furfirst.com',
    password: 'password123'
  });

  const res = await request(app).post('/api/auth/login').send({
    email: 'owner@furfirst.com',
    password: 'password123'
  });
  token = res.body.token;
}, 60000);

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

describe('Pet Routes', () => {
  let petId;

  describe('POST /api/pets', () => {
    it('should add a new pet', async () => {
      const res = await request(app)
        .post('/api/pets')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Bella',
          species: 'dog',
          breed: 'Labrador',
          age: 3,
          weight: 25
        });
      expect(res.statusCode).toBe(201);
      expect(res.body.pet.name).toBe('Bella');
      petId = res.body.pet._id;
    });
  });

  describe('GET /api/pets', () => {
    it('should get all pets for owner', async () => {
      const res = await request(app)
        .get('/api/pets')
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('PUT /api/pets/:id', () => {
    it('should update a pet', async () => {
      const res = await request(app)
        .put(`/api/pets/${petId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ age: 4 });
      expect(res.statusCode).toBe(200);
      expect(res.body.pet.age).toBe(4);
    });
  });

  describe('DELETE /api/pets/:id', () => {
    it('should delete a pet', async () => {
      const res = await request(app)
        .delete(`/api/pets/${petId}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toBe(200);
    });
  });
});