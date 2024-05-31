// Import mongoose and dotenv if necessary
import mongoose from 'mongoose';
import { config } from 'dotenv';
config();

// Define the connectDB function
const database = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_LOCAL);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Export the database function
export default database;
