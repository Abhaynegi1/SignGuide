const express = require('express');
const router = express.Router();
const contentController = require('../controllers/contentController');

router.post('/complete', contentController.markContentComplete);
router.get('/progress', contentController.getProgress);

module.exports = router;
