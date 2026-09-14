const Message = require('../models/Message');
const User = require('../models/User');

const getMessages = async (req, res) => {
  try {
    const messages = await Message.find().populate('sender', 'name photo role').sort({ createdAt: 1 });
    return res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch messages.' });
  }
};

const createMessage = async (req, res) => {
  try {
    const { message, file } = req.body;

    if (!message && !file) {
      return res.status(400).json({ message: 'Message content is required.' });
    }

    const msg = await Message.create({
      sender: req.user._id,
      message: message || '',
      file: file || '',
    });

    const populatedMessage = await msg.populate('sender', 'name photo role');
    return res.status(201).json(populatedMessage);
  } catch (error) {
    res.status(500).json({ message: 'Failed to send message.' });
  }
};

module.exports = { getMessages, createMessage };
