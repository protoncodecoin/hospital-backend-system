const app = require('../app');
const supertest = require('supertest');
// const request = supertest('http://localhost:8000');
const request = supertest(app);

console.log(request);

// api/v1/doctors/my-patients/
it('Gets List of Patient for Doctor', async () => {
  const response = await request.get('/api/v1/doctors/my-patients/');

  expect(response.status).toBe(401);
}, 10000);
