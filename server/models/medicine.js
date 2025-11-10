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
  patient: {
    type: Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  patient_id: {
    type: Schema.Types.ObjectId,
    ref: 'Patient'
  },
  name: {
    type: String,
    required: true
  },
  dosage: {
    type: String
  },
  description: {
    type: String
  },
  compartmentNumber: {
    type: Number,
    required: true
  },
  quantity_in_box: {
    type: Number
  },
  section_number: {
    type: Number
  },
  stock: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['Tersedia', 'Hampir Habis', 'Habis'],
    default: 'Tersedia'
  },
  schedule: [scheduleItemSchema],
  storage_temp_limit: {
    type: Number
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Medicine', medicineSchema);