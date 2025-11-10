const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Skema untuk jadwal minum obat
const scheduleItemSchema = new Schema({
  time: { // cth: "08:00"
    type: String,
    required: true
  },
  dose: { // cth: 1 (untuk 1 tablet)
    type: Number,
    required: true,
    default: 1
  }
}, { _id: false }); // _id: false agar tidak membuat ObjectId untuk sub-dokumen

const medicineSchema = new Schema({
  patient_id: {
    type: Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  }, // [cite: 56, 67]
  name: {
    type: String,
    required: true
  }, // [cite: 56, 67]
  dosage: {
    type: String
  }, // [cite: 57, 68]
  quantity_in_box: {
    type: Number,
    required: true
  }, // [cite: 58, 69]
  section_number: { // Posisi obat di dalam box
    type: Number,
    required: true
  }, // [cite: 59, 70]
  schedule: [scheduleItemSchema], // [cite: 60, 71]
  storage_temp_limit: { // Batas suhu obat
    type: Number
  } // [cite: 63, 73]
}, {
  timestamps: true // [cite: 64, 65, 74, 75]
});

module.exports = mongoose.model('Medicine', medicineSchema);