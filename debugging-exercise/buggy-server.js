/**
 * ==============================================================================
 * BDF LAB 3 - DEBUGGING EXERCISE (FACULTY HANDOUT - BROKEN VERSION)
 * ==============================================================================
 * This file demonstrates the 4 common errors handed out in the lab exercise:
 * 1. Wrong import path (Cannot find module / MODULE_NOT_FOUND)
 * 2. Missing await on asynchronous database query (Promise <pending>)
 * 3. Table-name typo (SQLITE_ERROR: no such table: book)
 * 4. Port conflict (Error: listen EADDRINUSE: address already in use :::3000)
 * ==============================================================================
 */

const express = require('express');

// ❌ BUG 1: WRONG IMPORT PATH
// The file is located at '../src/db', but someone wrote '../src/database'
// Runtime Error: Error: Cannot find module '../src/database' (MODULE_NOT_FOUND)
// FIX: Change '../src/database' to '../src/db'
let getDb;
try {
  getDb = require('../src/database').getDb;
} catch (err) {
  console.error('\n============================================================');
  console.error('❌ BUG 1 DETECTED [Wrong Import Path]:');
  console.error(err.message);
  console.error('👉 FIX: Correct the import to: require("../src/db")');
  console.error('============================================================\n');
  getDb = require('../src/db').getDb; // Fallback to allow next demonstration
}

const app = express();
app.use(express.json());

// ❌ BUG 2: MISSING AWAIT & ❌ BUG 3: TABLE-NAME TYPO
// In the handler below:
// 1. db.all(...) returns a Promise, but without `await`, `books` is [object Promise]
// 2. The query says 'FROM book' instead of 'FROM books' -> SQLITE_ERROR: no such table: book
app.get('/broken-books', async (req, res) => {
  try {
    const db = await getDb();

    // ❌ Bug 3: Typo 'book' instead of 'books'
    // ❌ Bug 2: Missing 'await' before db.all(...)
    // const books = db.all("SELECT * FROM book"); // <-- BROKEN CODE

    console.log('\n--- Demonstrating Bug 2: Missing await ---');
    const pendingPromise = db.all('SELECT * FROM books');
    console.log('Without await, books is:', pendingPromise); // Logs: Promise { <pending> }

    console.log('\n--- Demonstrating Bug 3: Table-name typo ---');
    try {
      await db.all('SELECT * FROM book'); // 'book' does not exist
    } catch (sqlErr) {
      console.error('SQL Error caught:', sqlErr.message); // SQLITE_ERROR: no such table: book
    }

    // Fixed version:
    const fixedBooks = await db.all('SELECT * FROM books');
    res.status(200).json({
      message: 'Fixed response after adding await and correcting table name to books',
      data: fixedBooks,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ❌ BUG 4: PORT CONFLICT (EADDRINUSE)
// Hardcoding a port without fallback or without catching the error event crashes Node.
// FIX: Use process.env.PORT || 3000, and attach server.on('error', (err) => { if (err.code === 'EADDRINUSE') ... })
const PORT = process.env.PORT || 3000;

function startBuggyServer() {
  const server = app.listen(PORT, () => {
    console.log(`[Buggy Demo Server] Started on port ${PORT}`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error('\n============================================================');
      console.error('❌ BUG 4 DETECTED [Port Conflict - EADDRINUSE]:');
      console.error(`Port ${PORT} is already occupied by another running server.`);
      console.error(`👉 FIX: Listen on an alternate port or release port ${PORT}.`);
      console.error('============================================================\n');
    } else {
      console.error('Server error:', err);
    }
  });
}

// Run test if executed directly
if (require.main === module) {
  startBuggyServer();
}

module.exports = { app, startBuggyServer };
