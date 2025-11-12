const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: {
    type: String,
    required: true
  }, // [cite: 48]
  email: {
    type: String,
    required: true,
    unique: true
  }, // [cite: 49]
  phone: {
    type: String
  }, // [cite: 50]
  password: {
    type: String,
    required: true
  }, // [cite: 51]
  role: {
    type: String,
    enum: ['caregiver', 'patient', 'pharmacist'], // Sesuaikan dengan kebutuhan
    default: 'caregiver'
  }, // [cite: 52]
  linked_patients: [{
    type: Schema.Types.ObjectId,
    ref: 'Patient'
  }], // [cite: 53]
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
  }
}, {
  timestamps: true // Otomatis menambahkan createdAt dan updatedAt [cite: 54]
});

module.exports = mongoose.model('User', userSchema);