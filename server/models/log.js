const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const logSchema = new Schema({
  patient: {
    type: Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  patient_id: {
    type: Schema.Types.ObjectId,
    ref: 'Patient'
  },
  medicine: {
    type: Schema.Types.ObjectId,
    ref: 'Medicine'
  },
  medicine_id: [{
    type: Schema.Types.ObjectId,
    ref: 'Medicine'
  }],
  deviceId: {
    type: String
  },
  device_id: {
    type: Schema.Types.ObjectId,
    ref: 'Device'
  },
  action: {
    type: String,
    enum: ['taken', 'missed', 'skipped'],
    required: true
  },
  status: {
    type: String,
    enum: ['on_time', 'late', 'missed', 'overdose'],
    required: true
  },
  description: {
    type: String
  },
  servo_active: [{
    type: Number
  }],
  button_pressed: {
    type: Boolean
  },
  photodiode_triggered: {
    type: Boolean
  },
  fan_status: {
    type: Boolean
  },
  timestamp: {
    type: Date,
    required: true,
    default: Date.now
  },
  schedule_time: {
    type: String
  },
  delay_seconds: {
    type: Number
  },
  compliance_status: {
    type: String,
    enum: ['on-time', 'late', 'missed', 'overdose']
  },
  temperature: {
    type: Number
  },
  humidity: {
    type: Number
  },
  notes: {
    type: String
  },
  aksi: {
    type: String
  },
  waktu_konsumsi_seharusnya: {
    type: Date
  },
  timestamp_konsumsi_aktual: {
    type: Date
  },
  isRead: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: { createdAt: true, updatedAt: false }
});

module.exports = mongoose.model('Log', logSchema);