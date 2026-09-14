const User = require('../models/User');

const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    return res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch users.' });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    return res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch user.' });
  }
};

const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (req.user._id.toString() !== user._id.toString() && req.user.role !== 'manager') {
      return res.status(403).json({ message: 'You are not allowed to edit this profile.' });
    }

    const { name, bio, skills, job, photo } = req.body;
    if (name) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (skills) user.skills = Array.isArray(skills) ? skills : skills.split(',').map((skill) => skill.trim()).filter(Boolean);
    if (job !== undefined) user.job = job;
    if (photo) user.photo = photo;

    await user.save();
    return res.json({ message: 'Profile updated.', user: { ...user.toObject(), password: undefined } });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update profile.' });
  }
};

module.exports = {
  getUsers,
  getUserById,
  updateUser,
};
