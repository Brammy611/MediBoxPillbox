const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const aiReportSchema = new Schema({
  patient_id: {
    type: Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  }, // [cite: 107]
  report_date: {
    type: Date,
    default: Date.now
  }, // [cite: 107]
  anomaly_detected: {
    type: Boolean,
    default: false
  }, // [cite: 108]
  ai_summary: {
    type: String
  }, // [cite: 109]
  suggestions: [{
    type: String
  }] // [cite: 110, 111]
}, {
  timestamps: true // [cite: 112]
});

module.exports = mongoose.model('AiReport', aiReportSchema);