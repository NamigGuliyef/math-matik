
const mongoose = require('mongoose');

async function debug() {
  try {
    // Try to get connection string from env or use default
    // In NestJS projects, it's usually in .env, but I'll try common local ones
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/math-matik';
    console.log('Connecting to:', mongoUri);
    
    await mongoose.connect(mongoUri);
    
    const UserSchema = new mongoose.Schema({}, { strict: false });
    const BattleSchema = new mongoose.Schema({}, { strict: false });
    
    const User = mongoose.model('User', UserSchema);
    const Battle = mongoose.model('Battle', BattleSchema);

    console.log('--- Battle Summary ---');
    const totalBattles = await Battle.countDocuments();
    const finishedBattles = await Battle.countDocuments({ status: 'finished' });
    const winnerExists = await Battle.countDocuments({ winnerId: { $exists: true, $ne: null } });
    
    console.log(`Total: ${totalBattles}, Finished: ${finishedBattles}, With Winner: ${winnerExists}`);

    if (winnerExists > 0) {
      const sample = await Battle.findOne({ winnerId: { $exists: true, $ne: null } });
      console.log('Sample Battle:', JSON.stringify({
        _id: sample._id,
        status: sample.status,
        winnerId: sample.winnerId,
        winnerIdType: typeof sample.winnerId,
        winnerIdIsObjectId: sample.winnerId instanceof mongoose.Types.ObjectId
      }, null, 2));

      const winnerUser = await User.findById(sample.winnerId);
      if (winnerUser) {
        console.log('Winner User found:', JSON.stringify({
          _id: winnerUser._id,
          grade: winnerUser.grade,
          role: winnerUser.role
        }, null, 2));
      } else {
        console.log('Winner User NOT FOUND for ID:', sample.winnerId);
      }
    } else {
        // Check for any battle to see what IDs look like
        const anyBattle = await Battle.findOne();
        if (anyBattle) {
            console.log('Any Battle Sample:', JSON.stringify({
                _id: anyBattle._id,
                userId: anyBattle.userId,
                opponentId: anyBattle.opponentId,
                status: anyBattle.status
            }, null, 2));
        }
    }

    console.log('--- Aggregation Test ---');
    const result = await Battle.aggregate([
      { $match: { status: 'finished', winnerId: { $exists: true, $ne: null } } },
      {
        $lookup: {
          from: 'users',
          localField: 'winnerId',
          foreignField: '_id',
          as: 'winner',
        },
      },
      { $unwind: '$winner' },
      {
        $group: {
          _id: '$winner.grade',
          count: { $sum: 1 }
        }
      }
    ]);
    console.log('Aggregation result (simple):', JSON.stringify(result, null, 2));

    await mongoose.disconnect();
  } catch (err) {
    console.error('Debug failed:', err);
  }
}

debug();
