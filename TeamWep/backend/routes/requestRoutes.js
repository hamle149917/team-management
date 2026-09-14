const express = require('express');
const { getRequests, createRequest, acceptRequest, rejectRequest } = require('../controllers/requestController');
const { protect, managerOnly } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, getRequests);
router.post('/', protect, createRequest);
router.put('/:id/accept', protect, managerOnly, acceptRequest);
router.put('/:id/reject', protect, managerOnly, rejectRequest);

module.exports = router;
