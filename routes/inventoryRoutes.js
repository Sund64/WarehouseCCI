const express = require('express');
const inventoryController = require('../controllers/inventoryController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const router = express.Router();

router.get('/stok', protect, inventoryController.getStok);

router.post(
  '/transfer', 
  protect, 
  authorize('Super Admin', 'Manager'), 
  inventoryController.transferGudang
);

module.exports = router;