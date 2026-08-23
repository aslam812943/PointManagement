import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

async function run() {
  await mongoose.connect(MONGO_URI);
  try {
    const db = mongoose.connection.db;
    
    // Find programs on the 22nd
    const programs = await db.collection('programs').find({ date: '2026-08-22' }).toArray();
    const programIds = programs.map(p => p._id);
    
    console.log(`Found ${programs.length} programs on 2026-08-22`);
    
    // Find results for those programs
    const results = await db.collection('results').find({ programId: { $in: programIds } }).toArray();
    console.log(`Found ${results.length} results to delete.`);
    
    const POINTS = { FIRST: 10, SECOND: 7, THIRD: 5, FOURTH: 3, FIFTH: 2 };
    
    for (const r of results) {
      console.log(`Deleting result ${r._id} for program ${r.programId}`);
      // Revert points
      if (r.firstPlace) await db.collection('teams').updateOne({ _id: new mongoose.Types.ObjectId(r.firstPlace) }, { $inc: { totalPoints: -POINTS.FIRST } });
      if (r.secondPlace) await db.collection('teams').updateOne({ _id: new mongoose.Types.ObjectId(r.secondPlace) }, { $inc: { totalPoints: -POINTS.SECOND } });
      if (r.thirdPlace) await db.collection('teams').updateOne({ _id: new mongoose.Types.ObjectId(r.thirdPlace) }, { $inc: { totalPoints: -POINTS.THIRD } });
      if (r.fourthPlace) await db.collection('teams').updateOne({ _id: new mongoose.Types.ObjectId(r.fourthPlace) }, { $inc: { totalPoints: -POINTS.FOURTH } });
      if (r.fifthPlace) await db.collection('teams').updateOne({ _id: new mongoose.Types.ObjectId(r.fifthPlace) }, { $inc: { totalPoints: -POINTS.FIFTH } });
      
      // Delete result
      await db.collection('results').deleteOne({ _id: r._id });
    }
    
    // Fix any negative points just in case
    await db.collection('teams').updateMany({ totalPoints: { $lt: 0 } }, { $set: { totalPoints: 0 } });
    
    console.log('Successfully deleted results and reverted points.');
  } catch(e) {
    console.error(e);
  } finally {
    mongoose.disconnect();
  }
}
run();
