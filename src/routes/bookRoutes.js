const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const {
  validateBookBody,
  validateBookId,
  validateBookQueryParams,
} = require('../middleware/validation');

/**
 * RESTful routes for /books
 * Nouns are used for endpoints; HTTP methods specify actions:
 * - GET    /books     -> List/Search/Filter/Sort books
 * - GET    /books/:id -> Retrieve single book
 * - POST   /books     -> Create book
 * - PUT    /books/:id -> Update book
 * - DELETE /books/:id -> Delete book
 */

router.get('/', validateBookQueryParams, bookController.getAllBooks);
router.get('/:id', validateBookId, bookController.getBookById);
router.post('/', validateBookBody, bookController.createBook);
router.put('/:id', validateBookId, validateBookBody, bookController.updateBook);
router.delete('/:id', validateBookId, bookController.deleteBook);

module.exports = router;
