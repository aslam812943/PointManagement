import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

async function run() {
  await mongoose.connect(MONGO_URI);
  try {
    const db = mongoose.connection.db;
    const programCollection = db.collection('programs');
    const today = new Date().toISOString().split('T')[0]; // Current date
    
    await programCollection.insertOne({
      name: "Test Program",
      date: today,
      location: "Testing Arena",
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    console.log(`Created test program for date: ${today}`);
  } catch(e) {
    console.error(e);
  } finally {
    mongoose.disconnect();
  }
}
run();
