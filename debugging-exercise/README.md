# Lab 3 Debugging Exercise: Analysis & Resolutions

**Course:** Backend Development Fundamentals (BDF)  
**Faculty:** Sai Shiva Teja  
**Student:** S. Kiran Teja (Registration No: `252U1R8083`)  

During the Lab 3 debugging exercise, students were provided with a broken version of the Node.js Express server containing four deliberate, high-frequency backend bugs. Below is the systematic diagnostic analysis and solution for each error.

---

### Bug 1: Port Conflict (`EADDRINUSE`)

#### Error Trace:
```text
Error: listen EADDRINUSE: address already in use :::3000
    at Server.setupListenHandle [as _listen2] (node:net:1904:16)
    at listenInCluster (node:net:1961:12)
    at Server.listen (node:net:2063:7)
    at Function.listen (.../express/lib/application.js:635:24)
Emitted 'error' event on Server instance at:
    at emitErrorNT (node:net:1940:8)
```

#### Root Cause:
Another application (or a previous unclosed instance of Node.js) was already bound to and actively listening on TCP port `3000`. Operating system network stacks do not allow two distinct sockets to bind to the same IP/port tuple without `SO_REUSEPORT`.

#### Solution:
1. **Dynamic Port Allocation**: Use `process.env.PORT || 3000` instead of hardcoded numbers.
2. **Error Event Listener**: Gracefully catch the `'error'` event on the `http.Server` instance.
3. **Process Termination**:
   - In Windows PowerShell:
     ```powershell
     Get-NetTCPConnection -LocalPort 3000 | Select-Object OwningProcess
     Stop-Process -Id <PID> -Force
     ```
   - In Unix/macOS:
     ```bash
     lsof -i :3000
     kill -9 <PID>
     ```

#### Code Fix:
```javascript
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Please switch ports in .env or kill the running process.`);
    process.exit(1);
  }
});
```

---

### Bug 2: Wrong Import Path (`MODULE_NOT_FOUND`)

#### Error Trace:
```text
node:internal/modules/cjs/loader:1252
  throw err;
  ^

Error: Cannot find module '../src/database'
Require stack:
- C:\...\debugging-exercise\buggy-server.js
    at Module._resolveFilename (node:internal/modules/cjs/loader:1249:15)
    at Module._load (node:internal/modules/cjs/loader:1075:27)
    at Module.require (node:internal/modules/cjs/loader:1337:19)
    code: 'MODULE_NOT_FOUND'
```

#### Root Cause:
The developer attempted to import `../src/database`, but the actual filename was `db.js` located at `../src/db`. CommonJS `require()` searches the exact relative path and file extensions `.js`, `.json`, and `.node`. Because no `database.js` or `database/index.js` existed, Node threw `MODULE_NOT_FOUND`.

#### Solution:
Update the relative require path to point to the correct module file (`../src/db`).

#### Code Fix:
```javascript
// ❌ Broken
const { getDb } = require('../src/database');

// ✅ Fixed
const { getDb } = require('../src/db');
```

---

### Bug 3: Table-Name Typo (`no such table: book`)

#### Error Trace:
```text
[Error] SQLITE_ERROR: no such table: book
    at Database.get (.../sqlite3/lib/sqlite3.js:15:23)
    at .../bookController.js:45:22
```

#### Root Cause:
In SQL relational databases, identifiers are strict. The table defined during migration/initialization was `books` (plural noun), but the query attempted to select from `book` (singular noun).

#### Solution:
Consistently adhere to plural noun naming conventions (`books`) for REST resources and database tables.

#### Code Fix:
```javascript
// ❌ Broken
const books = await db.all("SELECT * FROM book");

// ✅ Fixed
const books = await db.all("SELECT * FROM books");
```

---

### Bug 4: Missing `await` on Asynchronous Query

#### Error Trace / Symptom:
No fatal exception is thrown immediately, but the client receives an empty object `{}` or `[object Promise]`, or the server crashes later with `UnhandledPromiseRejection`.
```text
Console output:
books: Promise { <pending> }
HTTP Response body: {}
```

#### Root Cause:
Modern database libraries (such as `sqlite`) return JavaScript Promises for asynchronous database I/O operations (`db.get()`, `db.all()`, `db.run()`). Omitting the `await` keyword leaves the variable holding a pending `Promise` object rather than the resolved query rows. When Express executes `res.json(books)`, `JSON.stringify(Promise)` evaluates to `{}` because Promises have no enumerable own properties.

#### Solution:
Add `await` before any asynchronous database method inside `async` route handlers and controllers.

#### Code Fix:
```javascript
// ❌ Broken: Returns Promise { <pending> }, sends {}
const books = db.all("SELECT * FROM books");
res.json(books);

// ✅ Fixed: Awaits the resolved array of rows
const books = await db.all("SELECT * FROM books");
res.status(200).json(books);
```
