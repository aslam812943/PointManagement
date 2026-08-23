import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

const POINTS = { FIRST: 10, SECOND: 7, THIRD: 5, FOURTH: 3, FIFTH: 2 };

async function run() {
  await mongoose.connect(MONGO_URI);
  try {
    const db = mongoose.connection.db;
    
    // reset all teams to 0
    await db.collection('teams').updateMany({}, { $set: { totalPoints: 0 } });
    
    // tally points
    const results = await db.collection('results').find().toArray();
    for (const r of results) {
      if (r.firstPlace) await db.collection('teams').updateOne({ _id: new mongoose.Types.ObjectId(r.firstPlace) }, { $inc: { totalPoints: POINTS.FIRST } });
      if (r.secondPlace) await db.collection('teams').updateOne({ _id: new mongoose.Types.ObjectId(r.secondPlace) }, { $inc: { totalPoints: POINTS.SECOND } });
      if (r.thirdPlace) await db.collection('teams').updateOne({ _id: new mongoose.Types.ObjectId(r.thirdPlace) }, { $inc: { totalPoints: POINTS.THIRD } });
      if (r.fourthPlace) await db.collection('teams').updateOne({ _id: new mongoose.Types.ObjectId(r.fourthPlace) }, { $inc: { totalPoints: POINTS.FOURTH } });
      if (r.fifthPlace) await db.collection('teams').updateOne({ _id: new mongoose.Types.ObjectId(r.fifthPlace) }, { $inc: { totalPoints: POINTS.FIFTH } });
    }
    console.log('Points recalculated successfully');
  } catch(e) {
    console.error(e);
  } finally {
    mongoose.disconnect();
  }
}
run();
