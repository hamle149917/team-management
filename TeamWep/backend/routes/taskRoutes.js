const express = require('express');
const { getTasks, getTaskById, createTask, updateTask, deleteTask, submitTask, approveTask, rejectTask } = require('../controllers/taskController');
const { protect, managerOnly } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, getTasks);
router.get('/:id', protect, getTaskById);
router.post('/', protect, managerOnly, createTask);
router.put('/:id', protect, managerOnly, updateTask);
router.delete('/:id', protect, managerOnly, deleteTask);
router.post('/:id/submit', protect, submitTask);
router.post('/:id/approve', protect, managerOnly, approveTask);
router.post('/:id/reject', protect, managerOnly, rejectTask);

module.exports = router;
