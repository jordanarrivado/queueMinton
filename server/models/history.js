const mongoose = require('mongoose');
const moment = require('moment-timezone');

const gameHistorySchema = new mongoose.Schema({
  playerId: { type: mongoose.Schema.Types.ObjectId, ref: 'queues' }, 
  playerName: String,
  playerLevel:String,
  playerGender: String,
  playerWin: Number,
  playerLoss: Number,
  playerBall: Number,
  date: String
});

gameHistorySchema.pre('save', function(next) {
  this.date = moment(this.date).tz('Asia/Manila').format('MMMM DD, YYYY h:mm:ss A');
  next();
});

const GameHistoryModel = mongoose.model('History', gameHistorySchema);

module.exports = GameHistoryModel;
