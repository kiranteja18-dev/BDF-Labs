const express = require('express');
const cors = require('cors');
const bookRoutes = require('./routes/bookRoutes');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

const app = express();

// Standard middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Informative root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    project: 'Backend Development Fundamentals - Lab 3 REST API',
    student: {
      name: 'S. Kiran Teja',
      registrationNumber: '252U1R8083',
      section: 'CSE-QE-2B (S-13)',
      faculty: 'Sai Shiva Teja',
    },
    status: 'Running',
    endpoints: {
      getAllBooks: 'GET /books?search_q=&order_by=id&order=ASC&min_price=&max_price=&limit=10&offset=0',
      getBookById: 'GET /books/:id',
      createBook: 'POST /books',
      updateBook: 'PUT /books/:id',
      deleteBook: 'DELETE /books/:id',
    },
  });
});

// Mount /books REST routes
app.use('/books', bookRoutes);

// Fallback 404 handler for unknown routes
app.use(notFoundHandler);

// Centralized error handler
app.use(errorHandler);

module.exports = app;
