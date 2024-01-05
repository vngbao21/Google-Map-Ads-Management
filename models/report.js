const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reportSchema = new Schema({
  reportID: { type: String, unique: true, index: true },
  reportType: String,
  fullName: String,
  email: String,
  phone: String,
  reportContent: String,
  thoidiemgui: Date,
  tinhtrang: String,
  cachthucxuly: String,
  queryID: { type: String, required: true },
  image1: String, 
  image2: String
});

const Report = mongoose.model('Report', reportSchema);

module.exports = Report;