const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const loaiSchema = new Schema({
    loaiID: { type: String, required: true },
    loai: String,
});

const Loai = mongoose.model('Loai', loaiSchema);

module.exports = Loai;