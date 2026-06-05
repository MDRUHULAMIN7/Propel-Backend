import http from 'http';
import app from './app.js';
import connectDB from './app/DB/index.js';
import { initSocket } from './app/socket/index.js';
import config from './app/config/index.js';

const server = http.createServer(app);

// Socket.IO initialize
initSocket(server);

const startServer = async (): Promise<void> => {
  try {
    await connectDB();
    server.listen(config.port, () => {
      console.log(`🚀 Taskora server → http://localhost:${config.port}`);
      console.log(`📌 Environment: ${config.nodeEnv}`);
    });
  } catch (error) {
    console.error('❌ Server failed to start:', error);
    process.exit(1);
  }
};

startServer();

// Handle Unhandled Rejections and Uncaught Exceptions
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection detected:', err);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception detected:', err);
  process.exit(1);
});
