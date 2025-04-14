const mongoose = require("mongoose");
const {
  reqPlayerSchema,
  playerHistorySchema,
  playerSchema,
  matchSchema,
  inMatchSchema,
  courtSchema,
} = require("./schemas");

// Session Schema
const sessionSchema = new mongoose.Schema({
  sessionDate: { type: String, required: true },
  mode: { type: String, reqiured: true },
  players: [playerSchema],
  playerHistory: [playerHistorySchema],
  matches: [matchSchema],
  inMatch: [inMatchSchema],
  sessionRevenue: { type: Number, reqiured: true },
  reqToJoin: [reqPlayerSchema],
  qrCode: { type: String },
  textCode: {
    type: String,
    unique: true,
    sparse: true,
  },
});

// Area Schema
const areaSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sessions: [sessionSchema],
  courts: [courtSchema],
  courtFeeType: { type: String, required: true, default: "Per Head" },
  courtFee: { type: Number, required: true },
  ballFee: { type: Number, required: true },
});

const scheduleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  date: {
    type: String,
    required: true,
  },
  startTime: {
    type: String,
    required: true,
  },
  location: {
    type: String,
  },
});

// User Schema
const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: false,
  },
  profileImage: {
    type: String,
  },
  areas: [areaSchema],
  refreshToken: {
    type: String,
  },
  schedules: [scheduleSchema],
});

const UserModel = mongoose.model("User", userSchema);

module.exports = UserModel;
