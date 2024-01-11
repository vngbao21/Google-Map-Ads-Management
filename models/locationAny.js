const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const locationAnySchema = new Schema({
    locationAnyID: { type: String, required: true },
    nameAny: String,
    diachiAny: String,
    toadoXAny: Number,
    toadoYAny: Number
});

const LocationAny = mongoose.model('LocationAny', locationAnySchema);

module.exports = LocationAny;