const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const logSchema = new Schema({
  patient_id: {
    type: Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  }, // [cite: 89]
  device_id: {
    type: Schema.Types.ObjectId,
    ref: 'Device',
    required: true
  }, // [cite: 89]
  medicine_id: [{ // Bisa jadi lebih dari 1 obat diambil bersamaan
    type: Schema.Types.ObjectId,
    ref: 'Medicine'
  }], // [cite: 89, 90]
  servo_active: [{ // Servo nomor berapa saja yang bergerak
    type: Number
  }], // [cite: 91, 92, 93, 94]
  button_pressed: {
    type: Boolean
  }, // [cite: 95]
  photodiode_triggered: { // (Asumsi dari "photodiode_triggered" di PDF)
    type: Boolean
  }, // [cite: 96]
  fan_status: {
    type: Boolean
  }, // [cite: 97]
  timestamp: { // Waktu pasti event terjadi
    type: Date,
    required: true
  }, // [cite: 98]
  schedule_time: { // Jadwal seharusnya (cth: "08:00")
    type: String
  }, // [cite: 99]
  delay_seconds: { // Keterlambatan (jika ada)
    type: Number
  }, // [cite: 100]
  compliance_status: { // Status kepatuhan
    type: String,
    enum: ['on-time', 'late', 'missed', 'overdose']
  }, // [cite: 101]
  temperature: {
    type: Number
  }, // [cite: 102]
  humidity: {
    type: Number
  }, // [cite: 103]
  notes: {
    type: String
  } // [cite: 104]
}, {
  timestamps: { createdAt: true, updatedAt: false } // [cite: 105] (Hanya createdAt)
});

module.exports = mongoose.model('Log', logSchema);