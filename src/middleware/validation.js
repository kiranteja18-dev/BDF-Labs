/**
 * Validation middleware for Books REST API.
 * Ensures consistent error responses in format: { "message": "..." }
 */

// Allowed columns for sorting to prevent SQL injection
const ALLOWED_ORDER_BY = ['id', 'title', 'author', 'price', 'created_at'];

/**
 * Validates request body for POST /books and PUT /books/:id
 */
function validateBookBody(req, res, next) {
  const { title, author, price } = req.body;

  // Title validation
  if (title === undefined || title === null || typeof title !== 'string' || title.trim() === '') {
    return res.status(400).json({
      message: 'Title is required and must be a non-empty string',
    });
  }

  // Author validation
  if (author === undefined || author === null || typeof author !== 'string' || author.trim() === '') {
    return res.status(400).json({
      message: 'Author is required and must be a non-empty string',
    });
  }

  // Price validation
  if (
    price === undefined ||
    price === null ||
    price === '' ||
    isNaN(Number(price)) ||
    Number(price) < 0
  ) {
    return res.status(400).json({
      message: 'Price is required and must be a valid non-negative number',
    });
  }

  // Normalize trimmed values and numeric price
  req.body.title = title.trim();
  req.body.author = author.trim();
  req.body.price = parseFloat(Number(price).toFixed(2));

  next();
}

/**
 * Validates ID parameter in URL paths: /books/:id
 */
function validateBookId(req, res, next) {
  const { id } = req.params;
  const parsedId = parseInt(id, 10);

  if (isNaN(parsedId) || parsedId <= 0 || String(parsedId) !== String(id).trim()) {
    return res.status(400).json({
      message: 'Invalid book ID. ID must be a positive integer',
    });
  }

  req.params.id = parsedId;
  next();
}

/**
 * Validates query parameters for GET /books
 */
function validateBookQueryParams(req, res, next) {
  const { search_q, order_by, order, limit, offset, min_price, max_price } = req.query;

  // Validate order_by if provided
  if (order_by !== undefined && !ALLOWED_ORDER_BY.includes(order_by.toLowerCase())) {
    return res.status(400).json({
      message: `Invalid order_by field. Allowed fields: ${ALLOWED_ORDER_BY.join(', ')}`,
    });
  }

  // Validate order direction if provided
  if (order !== undefined) {
    const upperOrder = order.toUpperCase();
    if (upperOrder !== 'ASC' && upperOrder !== 'DESC') {
      return res.status(400).json({
        message: 'Invalid order direction. Allowed values: ASC, DESC',
      });
    }
  }

  // Validate limit if provided
  if (limit !== undefined) {
    const parsedLimit = parseInt(limit, 10);
    if (isNaN(parsedLimit) || parsedLimit <= 0) {
      return res.status(400).json({
        message: 'Limit must be a positive integer',
      });
    }
  }

  // Validate offset if provided
  if (offset !== undefined) {
    const parsedOffset = parseInt(offset, 10);
    if (isNaN(parsedOffset) || parsedOffset < 0) {
      return res.status(400).json({
        message: 'Offset must be a non-negative integer',
      });
    }
  }

  // Validate min_price if provided
  if (min_price !== undefined) {
    const parsedMin = Number(min_price);
    if (isNaN(parsedMin) || parsedMin < 0) {
      return res.status(400).json({
        message: 'min_price must be a valid non-negative number',
      });
    }
  }

  // Validate max_price if provided
  if (max_price !== undefined) {
    const parsedMax = Number(max_price);
    if (isNaN(parsedMax) || parsedMax < 0) {
      return res.status(400).json({
        message: 'max_price must be a valid non-negative number',
      });
    }
  }

  // Validate price range consistency
  if (min_price !== undefined && max_price !== undefined) {
    if (Number(min_price) > Number(max_price)) {
      return res.status(400).json({
        message: 'min_price cannot be greater than max_price',
      });
    }
  }

  next();
}

module.exports = {
  validateBookBody,
  validateBookId,
  validateBookQueryParams,
  ALLOWED_ORDER_BY,
};
