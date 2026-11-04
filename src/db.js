const path = require('path');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
require('dotenv').config();

let dbInstance = null;

/**
 * Initializes and returns the SQLite database connection.
 * Creates the `books` table and seeds default records if empty.
 */
async function initializeDatabase() {
  if (dbInstance) {
    return dbInstance;
  }

  const dbPath = process.env.DB_PATH
    ? path.resolve(process.env.DB_PATH)
    : path.resolve(__dirname, '../database.db');

  dbInstance = await open({
    filename: dbPath,
    driver: sqlite3.Database,
  });

  // Enable foreign keys
  await dbInstance.run('PRAGMA foreign_keys = ON;');

  // Create `books` table
  await dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS books (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      author TEXT NOT NULL,
      price REAL NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Seed default books if the table is empty
  const countResult = await dbInstance.get('SELECT COUNT(*) AS count FROM books');
  if (countResult.count === 0) {
    const seedBooks = [
      { title: 'Eloquent JavaScript', author: 'Marijn Haverbeke', price: 29.99 },
      { title: 'JavaScript: The Good Parts', author: 'Douglas Crockford', price: 19.99 },
      { title: 'Clean Code', author: 'Robert C. Martin', price: 42.50 },
      { title: 'The Pragmatic Programmer', author: 'Andrew Hunt & David Thomas', price: 49.95 },
      { title: 'Node.js Design Patterns', author: 'Mario Casciaro', price: 38.00 },
      { title: 'Learning SQL', author: 'Alan Beaulieu', price: 24.99 },
      { title: 'Designing Data-Intensive Applications', author: 'Martin Kleppmann', price: 54.00 },
      { title: 'You Don’t Know JS: Scope & Closures', author: 'Kyle Simpson', price: 15.50 },
    ];

    for (const book of seedBooks) {
      await dbInstance.run(
        'INSERT INTO books (title, author, price) VALUES (?, ?, ?)',
        [book.title, book.author, book.price]
      );
    }
    console.log(`[Database] Initialized and seeded with ${seedBooks.length} books.`);
  }

  return dbInstance;
}

/**
 * Get active database instance.
 */
async function getDb() {
  if (!dbInstance) {
    return await initializeDatabase();
  }
  return dbInstance;
}

module.exports = {
  initializeDatabase,
  getDb,
};
