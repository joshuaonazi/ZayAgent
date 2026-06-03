const mongoose = require("mongoose");
const env      = require("./env");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    throw error;
  }
};

mongoose.connection.on("disconnected", () => {
  console.warn("⚠️  MongoDB disconnected. Attempting reconnect...");
});

mongoose.connection.on("reconnected", () => {
  console.log("✅ MongoDB reconnected");
});

module.exports = connectDB;