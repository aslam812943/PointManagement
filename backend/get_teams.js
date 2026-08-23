import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

async function run() {
  await mongoose.connect(MONGO_URI);
  try {
    const db = mongoose.connection.db;
    const teams = await db.collection('teams').find().toArray();
    console.log(JSON.stringify(teams, null, 2));
  } catch(e) {
    console.error(e);
  } finally {
    mongoose.disconnect();
  }
}
run();
