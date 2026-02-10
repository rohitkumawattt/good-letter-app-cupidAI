import 'dotenv/config';
import { GoogleGenerativeAI } from "@google/generative-ai";
import Letter from '../models/Letter.js';
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const generateLetter = async (req, res) => {
  try {
    await autoCleanup();
    const prompt = `Write a very romantic, heart-touching Valentine's Day love letter.
The message MUST be written ONLY in Hinglish (Hindi written in English letters).
No pure English lines are allowed.

Tone: extremely romantic, emotional, soft, and cute.
Style: poetic, sweet, and full of love.
Content should feel personal, warm, and dreamy — like a true love confession.

Length: 2 short paragraphs only.
include emojis in the message.
Make it sound natural, not robotic.`;
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    // // 3. Save to DB
    const letter = new Letter({
      content: text,
      generatedBy: 'ai',
    });
    await letter.save();

    res.status(201).json({
      success: true,
      message: 'Letter generated successfully',
      letter: letter,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "AI service down, using database backup.",
      error: error.message
    });

  }
};

const getRandomLetter = async (req, res) => {
  try {
    const letter = await getRandomLetterFallback();
    if (letter) {
      return res.status(200).json({
        success: true,
        message: 'Random Letter fetched successfully',
        letter: letter,
      });
    } else {
      return res.status(404).json({ success: false, message: 'No letters found' });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Helper: Fetch random letter from DB
const getRandomLetterFallback = async () => {
  const count = await Letter.countDocuments();
  if (count === 0) return null;
  const random = Math.floor(Math.random() * count);
  const letter = await Letter.findOne().skip(random);
  return letter;
};

// Helper: Auto-cleanup to stay within storage limits
// Logic: If count > 1000 (approx threshold), delete oldest 20%
const autoCleanup = async () => {
  try {
    const MAX_DOCS = 1000; // Arbitrary limit for 500MB constraint safety (text is small, but safer is better)
    const count = await Letter.countDocuments();

    if (count > MAX_DOCS) {
      const deleteCount = Math.floor(count * 0.2); // Delete 20%
      const lettersToDelete = await Letter.find()
        .sort({ createdAt: 1 })
        .limit(deleteCount)
        .select('_id');

      const idsToDelete = lettersToDelete.map((doc) => doc._id);
      await Letter.deleteMany({ _id: { $in: idsToDelete } });
      console.log(`Auto-cleanup: Deleted ${deleteCount} old letters.`);
    }
  } catch (error) {
    console.error('Auto-cleanup error:', error);
  }
};

export {
  generateLetter,
  getRandomLetter,
};
