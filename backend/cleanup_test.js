import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

export const POINTS = {
  FIRST: 10,
  SECOND: 7,
  THIRD: 5,
  FOURTH: 3,
  FIFTH: 2,
};

async function run() {
  await mongoose.connect(MONGO_URI);
  try {
    const db = mongoose.connection.db;
    const programCollection = db.collection('programs');
    const resultCollection = db.collection('results');
    const teamCollection = db.collection('teams');
    
    // Find Test Program
    const testProgram = await programCollection.findOne({ name: "Test Program" });
    if (!testProgram) {
      console.log("Test Program not found.");
      return;
    }
    
    // Find all results for this program
    const results = await resultCollection.find({ programId: testProgram._id }).toArray();
    console.log(`Found ${results.length} results for Test Program.`);
    
    for (const result of results) {
      // Revert points
      if (result.firstPlace) await teamCollection.updateOne({ _id: result.firstPlace }, { $inc: { totalPoints: -POINTS.FIRST } });
      if (result.secondPlace) await teamCollection.updateOne({ _id: result.secondPlace }, { $inc: { totalPoints: -POINTS.SECOND } });
      if (result.thirdPlace) await teamCollection.updateOne({ _id: result.thirdPlace }, { $inc: { totalPoints: -POINTS.THIRD } });
      if (result.fourthPlace) await teamCollection.updateOne({ _id: result.fourthPlace }, { $inc: { totalPoints: -POINTS.FOURTH } });
      if (result.fifthPlace) await teamCollection.updateOne({ _id: result.fifthPlace }, { $inc: { totalPoints: -POINTS.FIFTH } });
      
      // Delete result
      await resultCollection.deleteOne({ _id: result._id });
      console.log(`Deleted result ${result._id} and reverted points.`);
    }
    
    // Delete program
    await programCollection.deleteOne({ _id: testProgram._id });
    console.log("Deleted Test Program.");
    
  } catch(e) {
    console.error(e);
  } finally {
    mongoose.disconnect();
  }
}
run();
