const Request = require('../models/Request');

const getRequests = async (req, res) => {
  try {
    const query = req.user.role === 'manager' ? {} : { user: req.user._id };
    const requests = await Request.find(query).populate('user', 'name email role').sort({ createdAt: -1 });
    return res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch requests.' });
  }
};

const createRequest = async (req, res) => {
  try {
    const { type, message, date } = req.body;

    if (!type || !message) {
      return res.status(400).json({ message: 'Request type and message are required.' });
    }

    const request = await Request.create({
      user: req.user._id,
      type,
      message,
      date: date || '',
      status: 'pending',
    });

    const populatedRequest = await request.populate('user', 'name email role');
    return res.status(201).json(populatedRequest);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create request.' });
  }
};

const acceptRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found.' });
    }

    request.status = 'accepted';
    request.managerResponse = req.body.managerResponse || 'Approved';
    await request.save();

    return res.json({ message: 'Request accepted.', request });
  } catch (error) {
    res.status(500).json({ message: 'Failed to accept request.' });
  }
};

const rejectRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found.' });
    }

    request.status = 'rejected';
    request.managerResponse = req.body.managerResponse || 'Rejected';
    await request.save();

    return res.json({ message: 'Request rejected.', request });
  } catch (error) {
    res.status(500).json({ message: 'Failed to reject request.' });
  }
};

module.exports = {
  getRequests,
  createRequest,
  acceptRequest,
  rejectRequest,
};
