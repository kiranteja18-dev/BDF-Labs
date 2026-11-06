/**
 * Automated Test Runner for BDF Lab 3 REST API.
 * Validates all endpoints, query parameters, validation rules, and status codes.
 */

const http = require('http');
const app = require('./src/app');
const { initializeDatabase } = require('./src/db');

const TEST_PORT = 3099;
const BASE_URL = `http://localhost:${TEST_PORT}`;

let server;

async function runTests() {
  console.log('===============================================================');
  console.log('  BDF LAB 3 - AUTOMATED REST API TEST SUITE');
  console.log('  Student: S. Kiran Teja (252U1R8083) | Section: CSE-QE-2B');
  console.log('  Faculty: Joel Prashanth D');
  console.log('===============================================================\n');

  // Initialize DB and start ephemeral test server
  await initializeDatabase();
  server = app.listen(TEST_PORT);

  const testCases = [
    {
      name: '1. Root Endpoint Check',
      method: 'GET',
      path: '/',
      expectedStatus: 200,
      validate: (data) => data.status === 'Running' && data.student.name === 'S. Kiran Teja',
    },
    {
      name: '2. GET /books (Default parameters: limit=10, offset=0, order_by=id ASC)',
      method: 'GET',
      path: '/books',
      expectedStatus: 200,
      validate: (data) => Array.isArray(data.data) && data.data.length > 0 && data.limit === 10,
    },
    {
      name: '3. GET /books with search_q (Partial Title Match LIKE)',
      method: 'GET',
      path: '/books?search_q=JavaScript',
      expectedStatus: 200,
      validate: (data) => data.data.every((b) => b.title.toLowerCase().includes('javascript')),
    },
    {
      name: '4. GET /books with order_by=price and order=DESC',
      method: 'GET',
      path: '/books?order_by=price&order=DESC',
      expectedStatus: 200,
      validate: (data) => {
        for (let i = 0; i < data.data.length - 1; i++) {
          if (data.data[i].price < data.data[i + 1].price) return false;
        }
        return true;
      },
    },
    {
      name: '5. GET /books with price-range filter (BETWEEN 20 AND 45)',
      method: 'GET',
      path: '/books?min_price=20&max_price=45',
      expectedStatus: 200,
      validate: (data) => data.data.every((b) => b.price >= 20 && b.price <= 45),
    },
    {
      name: '6. GET /books with pagination (limit=3, offset=2)',
      method: 'GET',
      path: '/books?limit=3&offset=2',
      expectedStatus: 200,
      validate: (data) => data.data.length <= 3 && data.offset === 2,
    },
    {
      name: '7. GET /books/:id (Existing ID)',
      method: 'GET',
      path: '/books/1',
      expectedStatus: 200,
      validate: (data) => data.data.id === 1 && Boolean(data.data.title),
    },
    {
      name: '8. GET /books/:id (Non-existent ID -> 404 Not Found)',
      method: 'GET',
      path: '/books/99999',
      expectedStatus: 404,
      validate: (data) => data.message.includes('not found'),
    },
    {
      name: '9. GET /books/:id (Invalid non-integer ID -> 400 Bad Request)',
      method: 'GET',
      path: '/books/abc',
      expectedStatus: 400,
      validate: (data) => data.message.includes('Invalid book ID'),
    },
    {
      name: '10. POST /books (Valid creation -> 201 Created)',
      method: 'POST',
      path: '/books',
      body: {
        title: 'Microservices with Node.js',
        author: 'David Gonzalez',
        price: 34.5,
      },
      expectedStatus: 201,
      validate: (data) => data.data.title === 'Microservices with Node.js' && data.data.price === 34.5,
    },
    {
      name: '11. POST /books (Missing Title -> 400 Bad Request)',
      method: 'POST',
      path: '/books',
      body: {
        author: 'Author without title',
        price: 25.0,
      },
      expectedStatus: 400,
      validate: (data) => data.message.includes('Title is required'),
    },
    {
      name: '12. POST /books (Missing Author -> 400 Bad Request)',
      method: 'POST',
      path: '/books',
      body: {
        title: 'Title without author',
        price: 25.0,
      },
      expectedStatus: 400,
      validate: (data) => data.message.includes('Author is required'),
    },
    {
      name: '13. POST /books (Non-numeric Price -> 400 Bad Request)',
      method: 'POST',
      path: '/books',
      body: {
        title: 'Book Title',
        author: 'Valid Author',
        price: 'not-a-number',
      },
      expectedStatus: 400,
      validate: (data) => data.message.includes('Price is required'),
    },
    {
      name: '14. PUT /books/:id (Update existing book -> 200 OK)',
      method: 'PUT',
      path: '/books/1',
      body: {
        title: 'Eloquent JavaScript (4th Edition)',
        author: 'Marijn Haverbeke',
        price: 32.0,
      },
      expectedStatus: 200,
      validate: (data) => data.data.title.includes('Eloquent JavaScript') && data.data.price === 32.0,
    },
    {
      name: '15. PUT /books/:id (Non-existent ID -> 404 Not Found)',
      method: 'PUT',
      path: '/books/99999',
      body: {
        title: 'Non-existent Book',
        author: 'Ghost Author',
        price: 10.0,
      },
      expectedStatus: 404,
      validate: (data) => data.message.includes('not found'),
    },
    {
      name: '16. DELETE /books/:id (Existing ID -> 200 OK)',
      method: 'DELETE',
      // Dynamically target a newly created book ID
      setup: async () => {
        const createRes = await fetch(`${BASE_URL}/books`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: 'Temporary Deletion Target',
            author: 'Temp Author',
            price: 15.00,
          }),
        });
        const created = await createRes.json();
        return `/books/${created.data.id}`;
      },
      expectedStatus: 200,
      validate: (data) => data.message.includes('deleted successfully'),
    },
    {
      name: '17. DELETE /books/:id (Non-existent ID -> 404 Not Found)',
      method: 'DELETE',
      path: '/books/99999',
      expectedStatus: 404,
      validate: (data) => data.message.includes('not found'),
    },
    {
      name: '18. GET /books (Invalid min_price > max_price -> 400 Bad Request)',
      method: 'GET',
      path: '/books?min_price=100&max_price=20',
      expectedStatus: 400,
      validate: (data) => data.message.includes('min_price cannot be greater than max_price'),
    },
    {
      name: '19. GET /undefined-route (404 Fallback Handler)',
      method: 'GET',
      path: '/api/unknown',
      expectedStatus: 404,
      validate: (data) => data.message.includes('Route not found'),
    },
  ];

  let passed = 0;
  let failed = 0;

  for (const tc of testCases) {
    try {
      const dynamicPath = tc.setup ? await tc.setup() : tc.path;
      const url = `${BASE_URL}${dynamicPath}`;
      const options = {
        method: tc.method,
        headers: {
          'Content-Type': 'application/json',
        },
      };

      if (tc.body) {
        options.body = JSON.stringify(tc.body);
      }

      const res = await fetch(url, options);
      const data = await res.json();

      const statusMatches = res.status === tc.expectedStatus;
      const validationMatches = tc.validate ? tc.validate(data) : true;

      if (statusMatches && validationMatches) {
        console.log(`✅ [PASS] ${tc.name}`);
        console.log(`   Status: ${res.status} | Response: ${JSON.stringify(data).substring(0, 90)}...`);
        passed++;
      } else {
        console.error(`❌ [FAIL] ${tc.name}`);
        console.error(`   Expected Status: ${tc.expectedStatus}, Got: ${res.status}`);
        console.error(`   Response Body:`, data);
        failed++;
      }
    } catch (err) {
      console.error(`❌ [EXCEPTION] ${tc.name}:`, err.message);
      failed++;
    }
  }

  console.log('\n===============================================================');
  console.log(`Test Results Summary: ${passed} Passed, ${failed} Failed out of ${testCases.length} Tests.`);
  console.log('===============================================================\n');

  server.close();
  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch((err) => {
  console.error('Fatal test runner error:', err);
  if (server) server.close();
  process.exit(1);
});
