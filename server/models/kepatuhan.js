const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const kepatuhanSchema = new Schema({
  patient_id: { type: Schema.Types.ObjectId, ref: 'Patient', required: true, index: true },
  log_id: { type: Schema.Types.ObjectId, ref: 'Log', required: true, unique: true, index: true },
  kepatuhan: { type: String, enum: ['Patuh', 'Tidak Patuh'], required: true },
  waktu_konsumsi_seharusnya: { type: Date, required: true },
  timestamp_konsumsi_aktual: { type: Date, required: true },
  aksi: { type: String, enum: ['Terima', 'Tolak'], required: true },
  confidence_score: { type: Number, min: 0, max: 1, default: 0.5 },
  method: { type: String, enum: ['qualcomm-ai', 'fallback'], default: 'qualcomm-ai' },
  created_at: { type: Date, default: Date.now, index: true }
}, { timestamps: true });

kepatuhanSchema.index({ patient_id: 1, created_at: -1 });
kepatuhanSchema.index({ log_id: 1 });
kepatuhanSchema.index({ patient_id: 1, kepatuhan: 1 });

module.exports = mongoose.model('Kepatuhan', kepatuhanSchema);
