/* =============================================
   APACHETA — DB CONNECTION
   MongoDB Atlas con connection caching para serverless
   ============================================= */

import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) throw new Error('MONGODB_URI no definida en .env.local');

// Caching de la conexión entre invocaciones serverless (evita N conexiones)
let cached = global.mongoose || { conn: null, promise: null };
global.mongoose = cached;

export async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      dbName: 'apacheta_prod',
      bufferCommands: false,
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
