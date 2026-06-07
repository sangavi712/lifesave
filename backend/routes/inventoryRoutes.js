import express from 'express';
import { getInventory, updateInventory } from '../controllers/inventoryController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getInventory)
  .put(protect, admin, updateInventory);

export default router;
