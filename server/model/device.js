const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const deviceSchema = new Schema({
  patient_id: {
    type: Schema.Types.ObjectId,
    ref: 'Patient',
    required: true,
    unique: true // Satu device hanya untuk satu pasien
  }, // [cite: 78]
  esp32_id: {
    type: String,
    required: true,
    unique: true
  }, // [cite: 79]
  serial_number: {
    type: String
  }, // [cite: 80]
  location: {
    type: String
  }, // [cite: 81]
  current_temp: {
    type: Number,
    default: 0
  }, // [cite: 82]
  current_humidity: {
    type: Number,
    default: 0
  }, // [cite: 83]
  fan_status: {
    type: Boolean,
    default: false
  }, // [cite: 84]
  buzzer_status: {
    type: Boolean,
    default: false
  }, // [cite: 85]
  last_active: {
    type: Date,
    default: Date.now
  }, // [cite: 86]
  firmware_version: {
    type: String
  } // [cite: 87]
}, {
  timestamps: true
});

module.exports = mongoose.model('Device', deviceSchema);