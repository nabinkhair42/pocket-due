import mongoose from "mongoose";
import { MongoClient } from "mongodb";

let connectionPromise: Promise<typeof mongoose> | null = null;
export const authMongoClient = new MongoClient(
  process.env.MONGODB_URI || "mongodb://localhost:27017/pocketDue"
);
export const authDatabase = authMongoClient.db();
let authConnectionPromise: Promise<MongoClient> | null = null;

export const connectDB = async (): Promise<void> => {
  if (!authConnectionPromise) authConnectionPromise = authMongoClient.connect();
  if (mongoose.connection.readyState === 1) {
    await authConnectionPromise;
    return;
  }
  if (connectionPromise) {
    await Promise.all([connectionPromise, authConnectionPromise]);
    return;
  }
  try {
    const mongoURI =
      process.env.MONGODB_URI || "mongodb://localhost:27017/pocketDue";

    connectionPromise = mongoose.connect(mongoURI, { serverSelectionTimeoutMS: 10_000 });
    await connectionPromise;
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    connectionPromise = null;
    throw error;
  }
};

export const disconnectDB = async (): Promise<void> => {
  try {
    await Promise.all([mongoose.disconnect(), authMongoClient.close()]);
    console.log("MongoDB disconnected");
  } catch (error) {
    console.error("MongoDB disconnection error:", error);
  }
};
