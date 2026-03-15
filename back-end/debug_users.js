
const mongoose = require('mongoose');

async function debug() {
  try {
    const mongoUri = 'mongodb://127.0.0.1:27017/math-matik';
    await mongoose.connect(mongoUri);
    
    const UserSchema = new mongoose.Schema({}, { strict: false });
    const User = mongoose.model('User', UserSchema);

    const stats = await User.aggregate([
      { $match: { role: 'student' } },
      {
        $group: {
          _id: '$grade',
          totalCorrectAnswers: { $sum: '$correctAnswers' },
          totalWins: { $sum: '$totalBattlesWon' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    console.log('User-based Class Ranking Stats:');
    console.log(JSON.stringify(stats, null, 2));

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

debug();
