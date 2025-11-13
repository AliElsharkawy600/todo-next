import mongoose from "mongoose";

const dbURI = process.env.DB_URI;

const connectDB = async () => {
  try {
    await mongoose.connect(dbURI);
    console.log("MongoDB connected successfully!");
    // console.log("➡️➡️➡️➡️➡️",dbURI);
  } catch (error) {
    console.log(`Database Connected Failed:(error)=>${error}`);
    process.exit(1);
  }
};

export default connectDB;
