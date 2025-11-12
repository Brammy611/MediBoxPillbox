const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const patientSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  username: {
    type: String,
    unique: true,
    sparse: true // Allows null values to be unique
  },
  email: {
    type: String,
    unique: true,
    sparse: true
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
  // Relasi ke caregiver (user)
  caregiver_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Relasi ke device
  device_id: {
    type: Schema.Types.ObjectId,
    ref: 'Device'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Patient', patientSchema);