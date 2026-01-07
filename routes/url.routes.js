const express = require('express');
const router = express.Router();
const { 
  shortenUrl, 
  redirectUrl, 
  getUrlStats, 
  deleteUrl 
} = require('../controllers/url.controller');
const { protect } = require('../middlewares/auth');

router.post('/shorten', protect, shortenUrl);
router.get('/:shortCode', redirectUrl);
router.get('/:shortCode/stats', protect, getUrlStats);
router.delete('/:shortCode', protect, deleteUrl);

module.exports = router;