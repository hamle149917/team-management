const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['day_off', 'combine_tasks', 'extra_task'],
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending',
  },
  managerResponse: {
    type: String,
    default: '',
  },
}, { timestamps: true });

module.exports = mongoose.model('Request', requestSchema);
