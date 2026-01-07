const express = require('express');
const router = express.Router();
const { 
  getUserUrls, 
  getDashboardStats 
} = require('../controllers/dashboard.controller');
const { protect } = require('../middlewares/auth');

router.get('/urls', protect, getUserUrls);
router.get('/stats', protect, getDashboardStats);

module.exports = router;