import express from 'express';
const router = express.Router();
import { generateLetter, getRandomLetterByCategoryAndLanguage,getDefaultLetter } from '../controllers/letterController.js';
import letterLimiter from '../middleware/rateLimit.middleware.js';

router.post('/generate',letterLimiter, generateLetter);
router.get('/categoryAndLanguage', getRandomLetterByCategoryAndLanguage);
router.get('/default', getDefaultLetter);

export default router;
