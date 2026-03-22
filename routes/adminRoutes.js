const express = require('express');
const router = express.Router();
const { getDashboardStats, getSecurityLogs } = require('../controllers/adminController');

// 👑 CEO Dashboard ke APIs
router.get('/dashboard-stats', getDashboardStats);
router.get('/security-logs', getSecurityLogs);

module.exports = router;