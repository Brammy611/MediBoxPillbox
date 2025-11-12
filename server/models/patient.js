const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const patientSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  username: {
    type: String,
    unique: true
  },
  email: {
    type: String,
    unique: true
  },
  phone: {
    type: String
  },
  birthDate: {
    type: Date
  },
  age: {
    type: Number
  },
  gender: {
    type: String,
    enum: ['Laki-laki', 'Perempuan']
  },
  address: {
    type: String
  },
  medicalHistory: {
    allergies: [{
      type: String
    }],
    conditions: [{
      type: String
    }]
  },
  ai_health_summary: {
    type: String
  },
  caregiver: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  deviceId: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Patient', patientSchema);