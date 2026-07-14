const express = require('express');
const inventoryController = require('../controllers/inventoryController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const router = express.Router();

// Semua staf, manager, dan admin bisa melihat stok (Read-only)
router.get('/stok', protect, inventoryController.getStok);

// Hanya Super Admin dan Manager yang berhak memindahkan stok barang antar cabang
router.post(
  '/transfer', 
  protect, 
  authorize('Super Admin', 'Manager'), 
  inventoryController.transferGudang
);

module.exports = router;