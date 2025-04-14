const mongoose = require('mongoose');

const reqJoinSchema = new mongoose.Schema({
  reqToJoin:[],
  qrCode: { type: String }, 
  textCode: { type: String, unique: true }
});

const ReqJoinModel = mongoose.model('reqJoin', reqJoinSchema);

module.exports = ReqJoinModel;



