require('dotenv').config();
const app = require('./app');
const { initializeDatabase } = require('./db');

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // Initialize SQLite database and create tables before listening
    await initializeDatabase();

    const server = app.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(`  BDF Lab 3 REST API Server Running`);
      console.log(`  Student: S. Kiran Teja (252U1R8083) | Sec: CSE-QE-2B`);
      console.log(`  URL: http://localhost:${PORT}`);
      console.log(`====================================================`);
    });

    // Handle port conflict (EADDRINUSE) gracefully
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`\n[FATAL ERROR] Port ${PORT} is already in use (EADDRINUSE).`);
        console.error(`Resolution Tips:`);
        console.error(`1. Set a different PORT in your .env file (e.g., PORT=3001).`);
        console.error(`2. In PowerShell, find the PID: Get-NetTCPConnection -LocalPort ${PORT}`);
        console.error(`3. Stop the conflicting process: Stop-Process -Id <PID> -Force\n`);
        process.exit(1);
      } else {
        console.error('[FATAL ERROR] Server startup failed:', error);
        process.exit(1);
      }
    });

    // Graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n[Server] Shutting down gracefully...');
      server.close(() => {
        console.log('[Server] Closed all connections.');
        process.exit(0);
      });
    });
  } catch (error) {
    console.error('[FATAL ERROR] Failed to initialize database:', error);
    process.exit(1);
  }
}

startServer();
