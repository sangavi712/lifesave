import express from 'express';
import {
  createDonor,
  getDonors,
  getDonorById,
  updateDonor,
  deleteDonor,
} from '../controllers/donorController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, createDonor)
  .get(protect, getDonors);

router.route('/:id')
  .get(protect, getDonorById)
  .put(protect, updateDonor)
  .delete(protect, deleteDonor);

export default router;
