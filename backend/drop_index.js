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
      const resultCollection = db.collection('results');
      try {
        await resultCollection.dropIndex('programId_1');
        console.log('Dropped programId_1 index');
      } catch (e) {
        console.log('Index programId_1 not found or already dropped');
      }
    }
  } catch(e) {
    console.error(e);
  } finally {
    mongoose.disconnect();
  }
}
run();
