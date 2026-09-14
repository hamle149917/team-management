const Task = require('../models/Task');
const User = require('../models/User');

const getTasks = async (req, res) => {
  try {
    if (req.user.role === 'manager') {
      const tasks = await Task.find().populate('assignedTo', 'name email role photo').populate('createdBy', 'name email role photo').sort({ createdAt: -1 });
      return res.json(tasks);
    }

    const tasks = await Task.find({ assignedTo: req.user._id }).populate('assignedTo', 'name email role photo').populate('createdBy', 'name email role photo').sort({ createdAt: -1 });
    return res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch tasks.' });
  }
};

const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate('assignedTo', 'name email role photo').populate('createdBy', 'name email role photo');

    if (!task) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    if (req.user.role !== 'manager' && task.assignedTo._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You are not allowed to view this task.' });
    }

    return res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch task.' });
  }
};

const createTask = async (req, res) => {
  try {
    const { title, description, example, assignedTo, deadline } = req.body;

    if (!title || !description || !assignedTo || !deadline) {
      return res.status(400).json({ message: 'Title, description, assignee, and deadline are required.' });
    }

    const member = await User.findById(assignedTo);
    if (!member || member.role !== 'member') {
      return res.status(400).json({ message: 'Please assign the task to a valid team member.' });
    }

    const task = await Task.create({
      title,
      description,
      example: example || '',
      assignedTo,
      createdBy: req.user._id,
      deadline: new Date(deadline),
      status: 'pending',
    });

    const populatedTask = await task.populate('assignedTo', 'name email role photo');
    return res.status(201).json(populatedTask);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create task.' });
  }
};

const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    const { title, description, example, assignedTo, deadline, status } = req.body;

    if (title) task.title = title;
    if (description) task.description = description;
    if (example !== undefined) task.example = example;
    if (assignedTo) task.assignedTo = assignedTo;
    if (deadline) task.deadline = new Date(deadline);
    if (status) task.status = status;

    await task.save();
    const updatedTask = await task.populate('assignedTo', 'name email role photo');
    return res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update task.' });
  }
};

const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    await task.deleteOne();
    return res.json({ message: 'Task deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete task.' });
  }
};

const submitTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    if (task.assignedTo.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You are not allowed to submit this task.' });
    }

    if (!['pending', 'in_progress', 'rejected'].includes(task.status)) {
      return res.status(403).json({ message: 'This task cannot be edited in its current status.' });
    }

    const { submissionMessage, files } = req.body;

    task.submissionMessage = submissionMessage || task.submissionMessage || '';
    task.files = files || task.files || [];
    task.status = 'submitted';
    task.submittedAt = new Date();
    task.managerFeedback = '';

    await task.save();
    return res.json({ message: 'Task submitted successfully.', task });
  } catch (error) {
    res.status(500).json({ message: 'Failed to submit task.' });
  }
};

const approveTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    task.status = 'approved';
    task.managerFeedback = req.body.managerFeedback || 'Approved';
    await task.save();
    return res.json({ message: 'Task approved.', task });
  } catch (error) {
    res.status(500).json({ message: 'Failed to approve task.' });
  }
};

const rejectTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    task.status = 'rejected';
    task.managerFeedback = req.body.managerFeedback || 'Please review and resubmit.';
    await task.save();
    return res.json({ message: 'Task rejected.', task });
  } catch (error) {
    res.status(500).json({ message: 'Failed to reject task.' });
  }
};

module.exports = {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  submitTask,
  approveTask,
  rejectTask,
};
