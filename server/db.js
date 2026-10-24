import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from project root
dotenv.config({ path: path.join(__dirname, '..', '.env') });

let isConnected = false;

export async function connectToDatabase() {
  const uri = process.env.MONGODB_URI;

  if (!uri || uri.includes('<username>') || uri.includes('<password>')) {
    console.warn('\n⚠️ [MongoDB Atlas] MONGODB_URI is not configured yet in .env');
    console.warn('👉 Please open .env and paste your MongoDB Atlas connection string from https://cloud.mongodb.com\n');
    return { success: false, reason: 'URI_NOT_CONFIGURED' };
  }

  try {
    console.log('🔄 Connecting to MongoDB Atlas...');
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    console.log('✅ [MongoDB Atlas] Successfully connected to MongoDB Atlas database!');
    return { success: true };
  } catch (error) {
    isConnected = false;
    console.error('❌ [MongoDB Atlas] Connection error:', error.message);
    return { success: false, error: error.message };
  }
}

export function isDbConnected() {
  return isConnected && mongoose.connection.readyState === 1;
}

export function getDbStatus() {
  const states = ['Disconnected', 'Connected', 'Connecting', 'Disconnecting'];
  const state = states[mongoose.connection.readyState] || 'Unknown';
  return {
    state,
    isConnected: isDbConnected(),
    databaseName: mongoose.connection.name || null,
    host: mongoose.connection.host || null
  };
}
