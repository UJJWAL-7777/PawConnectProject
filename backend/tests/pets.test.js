const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const Pet = require('../models/Pet');

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/pawconnect');
  }
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('Pets API Endpoints', () => {
  it('should fetch list of pets with pagination', async () => {
    const res = await request(app).get('/api/v1/pets?page=1&limit=5');

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.pagination).toBeDefined();
    expect(res.body.pagination.page).toBe(1);
  });

  it('should filter pets by species', async () => {
    const res = await request(app).get('/api/v1/pets?species=Dog');

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    if (res.body.data.length > 0) {
      expect(res.body.data.every((p) => p.species === 'Dog')).toBe(true);
    }
  });

  it('should filter pets by listingType (adoption vs sale)', async () => {
    const res = await request(app).get('/api/v1/pets?listingType=sale');

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    if (res.body.data.length > 0) {
      expect(res.body.data.every((p) => p.listingType === 'sale')).toBe(true);
    }
  });

  it('should reject unauthenticated pet creation', async () => {
    const res = await request(app)
      .post('/api/v1/pets')
      .send({
        name: 'Unauthorized Pet',
        species: 'Dog',
      });

    expect(res.statusCode).toBe(401);
  });
});
