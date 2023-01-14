/* eslint-disable */
import { Mongoose, connect } from 'mongoose';

declare global {
  var mongoose: {
    promise: Promise<Mongoose> | null;
    conn: Mongoose | null;
  };
}

const { MONGO_URI } = process.env;

if (!MONGO_URI) throw new Error('MONGO_URI not defined');

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export const dbConnect = async () => {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = connect(`${MONGO_URI}`).then((mongoose) => mongoose);
  }

  cached.conn = await cached.promise;
  return cached.conn;
};
