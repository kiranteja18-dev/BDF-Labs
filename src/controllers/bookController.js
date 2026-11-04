const { getDb } = require('../db');
const { ALLOWED_ORDER_BY } = require('../middleware/validation');

/**
 * GET /books
 * Supports search_q, min_price, max_price, order_by, order, limit, offset
 * All query values are parameterized to prevent SQL injection.
 */
async function getAllBooks(req, res, next) {
  try {
    const db = await getDb();

    // Query parameters with defaults
    const search_q = req.query.search_q ? String(req.query.search_q).trim() : '';
    const order_by = req.query.order_by ? String(req.query.order_by).toLowerCase() : 'id';
    const order = req.query.order ? String(req.query.order).toUpperCase() : 'ASC';
    const limit = req.query.limit !== undefined ? parseInt(req.query.limit, 10) : 10;
    const offset = req.query.offset !== undefined ? parseInt(req.query.offset, 10) : 0;
    const min_price = req.query.min_price !== undefined ? Number(req.query.min_price) : null;
    const max_price = req.query.max_price !== undefined ? Number(req.query.max_price) : null;

    // Build base parameterized query
    let whereClause = ' WHERE 1=1';
    const filterParams = [];

    // Partial title search using LIKE ?
    if (search_q !== '') {
      whereClause += ' AND title LIKE ?';
      filterParams.push(`%${search_q}%`);
    }

    // Price range filtering with BETWEEN or two conditions
    if (min_price !== null && max_price !== null) {
      whereClause += ' AND price BETWEEN ? AND ?';
      filterParams.push(min_price, max_price);
    } else if (min_price !== null) {
      whereClause += ' AND price >= ?';
      filterParams.push(min_price);
    } else if (max_price !== null) {
      whereClause += ' AND price <= ?';
      filterParams.push(max_price);
    }

    // Count total matching records for pagination metadata
    const countQuery = `SELECT COUNT(*) AS total FROM books${whereClause}`;
    const countResult = await db.get(countQuery, filterParams);
    const totalMatching = countResult ? countResult.total : 0;

    // Safe sorting with verified whitelist
    const safeOrderBy = ALLOWED_ORDER_BY.includes(order_by) ? order_by : 'id';
    const safeOrder = order === 'DESC' ? 'DESC' : 'ASC';

    // Construct final data query with limit and offset parameters
    const dataQuery = `SELECT id, title, author, price, created_at FROM books${whereClause} ORDER BY ${safeOrderBy} ${safeOrder} LIMIT ? OFFSET ?`;
    const dataParams = [...filterParams, limit, offset];

    const books = await db.all(dataQuery, dataParams);

    return res.status(200).json({
      message: 'Books retrieved successfully',
      total: totalMatching,
      count: books.length,
      limit: limit,
      offset: offset,
      filters: {
        search_q: search_q || null,
        min_price: min_price,
        max_price: max_price,
        order_by: safeOrderBy,
        order: safeOrder,
      },
      data: books,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /books/:id
 * Retrieves single book by primary key.
 * Returns 200 on success, 404 when not found.
 */
async function getBookById(req, res, next) {
  try {
    const db = await getDb();
    const { id } = req.params;

    const book = await db.get('SELECT id, title, author, price, created_at FROM books WHERE id = ?', [id]);

    if (!book) {
      return res.status(404).json({
        message: `Book not found with ID ${id}`,
      });
    }

    return res.status(200).json({
      message: 'Book retrieved successfully',
      data: book,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /books
 * Creates a new book record.
 * Returns 201 on success.
 */
async function createBook(req, res, next) {
  try {
    const db = await getDb();
    const { title, author, price } = req.body;

    const result = await db.run(
      'INSERT INTO books (title, author, price) VALUES (?, ?, ?)',
      [title, author, price]
    );

    const newBook = await db.get(
      'SELECT id, title, author, price, created_at FROM books WHERE id = ?',
      [result.lastID]
    );

    return res.status(201).json({
      message: 'Book created successfully',
      data: newBook,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /books/:id
 * Updates an existing book.
 * Returns 200 on success, 404 when not found.
 */
async function updateBook(req, res, next) {
  try {
    const db = await getDb();
    const { id } = req.params;
    const { title, author, price } = req.body;

    // Check if book exists
    const existing = await db.get('SELECT id FROM books WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({
        message: `Book not found with ID ${id}`,
      });
    }

    await db.run(
      'UPDATE books SET title = ?, author = ?, price = ? WHERE id = ?',
      [title, author, price, id]
    );

    const updatedBook = await db.get(
      'SELECT id, title, author, price, created_at FROM books WHERE id = ?',
      [id]
    );

    return res.status(200).json({
      message: 'Book updated successfully',
      data: updatedBook,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /books/:id
 * Deletes a book record.
 * Returns 200 on success, 404 when not found.
 */
async function deleteBook(req, res, next) {
  try {
    const db = await getDb();
    const { id } = req.params;

    const existing = await db.get('SELECT id, title, author, price, created_at FROM books WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({
        message: `Book not found with ID ${id}`,
      });
    }

    await db.run('DELETE FROM books WHERE id = ?', [id]);

    return res.status(200).json({
      message: 'Book deleted successfully',
      data: existing,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAllBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
};
