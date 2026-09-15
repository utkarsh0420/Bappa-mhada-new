import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const connUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/mhada_utsav_db";
    const conn = await mongoose.connect(connUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[MongoDB] Connected successfully: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.error(`[MongoDB] Connection error: ${error.message}`);
    return false;
  }
};

export default connectDB;
