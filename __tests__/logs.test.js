const fs = require('fs');
const pool = require('../lib/utils/pool');
const request = require('supertest');
const app = require('../lib/app');
const Recipe = require('../lib/models/recipe');
const Log = require('../lib/models/Log');

describe('recipe-lab routes', () => {
  beforeEach(() => {
    return pool.query(fs.readFileSync('./sql/setup.sql', 'utf-8'));
  });

  let recipe;

  beforeEach(async() => {
    recipe = await Recipe.insert({ name: 'recipe', directions: [
      'preheat oven to 375',
      'mix ingredients',
      'bake for 10 minutes',
      'MASH THEM POTATOS!'
    ] });
  });

  afterAll(() => {
    return pool.end();
  });

  it('should create a new log using POST', async() => {

    const res = await request(app)
      .post('/api/v1/logs')
      .send({
        dateOfEvent: '12/10/2020',
        notes: 'dajsbfkabsfjkba',
        rating: 10,
        recipeId: recipe.id
      });

    expect(res.body).toEqual({
      id: '1',
      dateOfEvent: '12/10/2020',
      notes: 'dajsbfkabsfjkba',
      rating: 10,
      recipeId: recipe.id
    });
  });

  it('should get all logs via GET', async() => {

    const logs = await Promise.all([
      {
        dateOfEvent: '12/10/2020',
        notes: 'no new notes',
        rating: 10,
        recipeId: recipe.id
      },
      {
        dateOfEvent: '12/05/2020',
        notes: 'make recipe better',
        rating: 5,
        recipeId: recipe.id
      }
    ].map(log => Log.insert(log)));

    const res = await request(app)
      .get('/api/v1/logs');

    expect(res.body).toEqual(expect.arrayContaining(logs));
    expect(res.body).toHaveLength(logs.length);
  });

  it('should get a log by id via GET', async() => {
    const log = await Log.insert({
      dateOfEvent: '12/05/2020',
      notes: 'make recipe better',
      rating: 5,
      recipeId: recipe.id
    });

    const res = await request(app)
      .get(`/api/v1/logs/${log.id}`);

    expect(res.body).toEqual(log);
  });

  it('should update a log using PUT', async() => {
    const log = await Log.insert({
      dateOfEvent: '12/05/2020',
      notes: 'make recipe better',
      rating: 5,
      recipeId: recipe.id
    });

    const res = await request(app)
      .put(`/api/v1/logs/${log.id}`)
      .send({
        dateOfEvent: '12/05/2020',
        notes: 'new recipe notes for test',
        rating: 5,
        recipeId: recipe.id
      });

    expect(res.body).toEqual({
      id: log.id,
      dateOfEvent: '12/05/2020',
      notes: 'new recipe notes for test',
      rating: 5,
      recipeId: recipe.id
    });
  });

  it('should delete a log using DELETE', async() => {
    const log = await Log.insert({
      dateOfEvent: '12/05/2020',
      notes: 'make recipe better',
      rating: 5,
      recipeId: recipe.id
    });

    const res = await request(app)
      .delete(`/api/v1/logs/${log.id}`);

    expect(log).toEqual(res.body);
  });

});
