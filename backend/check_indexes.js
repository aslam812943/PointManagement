import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

async function run() {
  await mongoose.connect(MONGO_URI);
  try {
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    if (collections.some(c => c.name === 'results')) {
      const indexes = await db.collection('results').indexes();
      console.log('Indexes on results collection:', indexes);
    } else {
      console.log('Results collection not found');
    }
  } catch(e) {
    console.error(e);
  } finally {
    mongoose.disconnect();
  }
}
run();
