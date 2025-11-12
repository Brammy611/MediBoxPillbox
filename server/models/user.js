const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  phone: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['caregiver', 'patient', 'pharmacist'],
    default: 'caregiver'
  },
  // Satu user hanya terhubung ke satu pasien
  patient_id: {
    type: Schema.Types.ObjectId,
    ref: 'Patient',
    default: null
  },
  // Field tambahan untuk Caregiver Profile
  gender: {
    type: String,
    enum: ['Laki-laki', 'Perempuan', 'Tidak Disebutkan']
  },
  address: {
    type: String
  },
  relationship: {
    type: String // Hubungan dengan pasien (Anak, Cucu, Keponakan, dll)
  },
  // Status apakah sudah setup pasien
  has_setup_patient: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);