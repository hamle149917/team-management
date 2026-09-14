const mongoose = require('mongoose');

const aiChatMessageSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  role: {
    type: String,
    enum: ['user', 'assistant'],
    required: true,
  },
  content: {
    type: String,
    required: true,
    trim: true,
  },
}, { timestamps: true });

aiChatMessageSchema.index({ user: 1, createdAt: 1 });

module.exports = mongoose.model('AIChatMessage', aiChatMessageSchema);
