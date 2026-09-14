const express = require('express');
const { getMessages, createMessage } = require('../controllers/messageController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, getMessages);
router.post('/', protect, createMessage);

module.exports = router;
