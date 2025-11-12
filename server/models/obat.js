const mongoose = require('mongoose');

const ObatSchema = new mongoose.Schema({
  noSekat: {
    type: Number,
    required: true,
    unique: true // Pastikan No. Sekat unik
  },
  namaObat: {
    type: String,
    required: [true, 'Nama obat tidak boleh kosong']
  },
  aturanMinum: {
    type: String,
    default: ''
  },
  deskripsi: {
    type: String,
    default: ''
  },
  statusObat: {
    type: String,
    enum: ['Kosong', 'Selesai', 'Aktif'],
    default: 'Aktif'
  },
  // Tambahkan relasi ke Patient/MedBox jika perlu
  patientId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Patient'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp sebelum save
ObatSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Obat', ObatSchema);
