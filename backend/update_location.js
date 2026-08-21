import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

async function run() {
  await mongoose.connect(MONGO_URI);
  try {
    const db = mongoose.connection.db;
    const programCollection = db.collection('programs');
    const updateResult = await programCollection.updateMany(
      { location: 'Kannur' },
      { $set: { location: 'Kaanoor' } }
    );
    console.log(`Updated ${updateResult.modifiedCount} programs`);
  } catch(e) {
    console.error(e);
  } finally {
    mongoose.disconnect();
  }
}
run();
