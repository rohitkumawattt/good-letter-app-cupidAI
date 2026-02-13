import express from 'express';
const router = express.Router();
import { generateLetter, getRandomLetter } from '../controllers/letterController.js';
import letterLimiter from '../middleware/rateLimit.middleware.js';

router.post('/generate', generateLetter);
router.get('/', getRandomLetter);

export default router;
