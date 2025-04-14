const mongoose = require("mongoose");

const reqPlayerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  gender: { type: String, required: true },
  level: { type: String, required: true },
  timeQueue: { type: String, required: true },
  deviceName: { type: String, required: false },
});

const playerHistorySchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, ref: "Player", required: true },
  name: { type: String, required: true },
  gender: { type: String, required: true },
  level: { type: String, required: true },
  win: { type: Number, default: 0 },
  loss: { type: Number, default: 0 },
  ball: { type: Number, default: 0 },
  deviceName: { type: String, required: false },
  transactions: [
    {
      transactionNo: { type: String, required: true },
      totalPaid: { type: Number, required: true },
      date: { type: Date, default: Date.now },
    },
  ],
});

// Players
const playerSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, ref: "Player", required: false },
  name: { type: String, required: true },
  gender: { type: String, required: true },
  level: { type: String, required: true },
  win: { type: Number, default: 0 },
  loss: { type: Number, default: 0 },
  ball: { type: Number, default: 0 },
  timeQueue: { type: String, required: true },
  deviceName: { type: String, required: false },
});

// Matches
const matchSchema = new mongoose.Schema({
  name: { type: String, required: true },
  team1: [{ type: mongoose.Schema.Types.ObjectId, ref: "Player" }],
  team2: [{ type: mongoose.Schema.Types.ObjectId, ref: "Player" }],
});

const inMatchSchema = new mongoose.Schema({
  name: { type: String, required: true },
  team1: [{ type: mongoose.Schema.Types.ObjectId, ref: "Player" }],
  team2: [{ type: mongoose.Schema.Types.ObjectId, ref: "Player" }],
});

// Courts
const courtSchema = new mongoose.Schema({
  name: { type: String, required: true },
  addMatches: [{ type: mongoose.Schema.Types.ObjectId, ref: "Match" }],
});

module.exports = {
  reqPlayerSchema,
  playerHistorySchema,
  playerSchema,
  matchSchema,
  inMatchSchema,
  courtSchema,
};
