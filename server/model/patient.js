const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const patientSchema = new Schema({
  caregiver_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }, // [cite: 115]
  username: {
    type: String,
    required: true,
    unique: true
  }, // [cite: 115]
  email: {
    type: String,
    required: true,
    unique: true
  }, // [cite: 116]
  phone: {
    type: String
  }, // [cite: 117]
  age: {
    type: Number
  }, // [cite: 118]
  gender: {
    type: String
  }, // [cite: 119]
  medical_history: [{
    type: String
  }], // [cite: 120, 121, 122]
  ai_health_summary: {
    type: String
  }, // [cite: 123]
  device_id: {
    type: Schema.Types.ObjectId,
    ref: 'Device',
    unique: true // Satu pasien hanya terhubung ke satu device
  } // [cite: 123]
}, {
  timestamps: true // [cite: 124, 125]
});

module.exports = mongoose.model('Patient', patientSchema);