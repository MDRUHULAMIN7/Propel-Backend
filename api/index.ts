// Vercel serverless function entry point
import app from '../src/app.js';
import connectDB from '../src/app/DB/index.js';

let isConnected = false;

const handler = async (req: any, res: any): Promise<void> => {
  if (!isConnected) {
    await connectDB();
    isConnected = true;
  }
  app(req, res);
};

export default handler;
