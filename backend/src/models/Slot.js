const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema({
  date: {
    type: String,
    required: [true, 'Date is required']
  },
  time: {
    type: String,
    required: [true, 'Time is required']
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  vetName: {
    type: String,
    default: 'Dr. Mark'
  }
}, { timestamps: true });

module.exports = mongoose.model('Slot', slotSchema);