import 'dotenv/config';
import { GoogleGenerativeAI } from "@google/generative-ai";
import Letter from '../models/Letter.model.js';
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const categoryPrompt = {
  valentine: `Write a very romantic, heart-touching Valentine's Day love letter in simple love English.
Tone: extremely romantic, emotional, soft, and cute.
Style: poetic, sweet, and full of love.
Content should feel personal, warm, and dreamy — like a true love confession.
Length: Around 120-150 letters only.
Include emojis naturally in the message.
Make it sound natural and not robotic.`,

  birthday: `Write a joyful, sweet, and celebratory Birthday message for my partner.
Tone: happy, loving, and emotionally warm.
Style: sweet, caring, and expressive.
Content should feel personal and full of gratitude and love.
Length: Around 120-150 letters only.
Include cute and loving emojis naturally.
Make it sound genuine and human-like.`,

  anniversary: `Write an emotional and deep anniversary wish celebrating our years of togetherness.
Tone: romantic, nostalgic, and heartfelt.
Style: poetic yet simple and meaningful.
Content should express love, memories, gratitude, and commitment.
Length: Around 120-150 letters only.
Include meaningful romantic emojis.
Make it sound natural and deeply emotional, not robotic.`,

  flirty: `Write a playful, charming, and cheeky flirty message.
Tone: fun, teasing, confident, and cute.
Style: light, attractive, and engaging.
Content should make the reader smile and feel special.
Length: Around 100-130 letters only.
Include playful emojis naturally.
Make it sound spontaneous and natural.`,

  sorry: `Write a sincere, humble, and heart-melting apology message.
Tone: emotional, regretful, and deeply honest.
Style: soft, caring, and genuine.
Content should express true regret and the desire to fix things.
Length: Around 120-150 letters only.
Include soft emotional emojis.
Make it sound real and heartfelt, not forced.`,

  longdistance: `Write an emotional and longing message for my partner who is far away.
Tone: loving, missing, and deeply emotional.
Style: poetic yet simple and touching.
Content should express how much I miss them and value our bond.
Length: Around 120-150 letters only.
Include emotional and love-filled emojis.
Make it feel personal and warm.`,

  daily: `Write a sweet and warm Good Morning or Good Night message.
Tone: soft, caring, and loving.
Style: simple, cute, and heart-touching.
Content should make the person feel special and loved.
Length: Around 80-120 letters only.
Include sweet emojis naturally.
Make it sound natural and comforting.`,

  healing: `Write a comforting and supportive message for someone going through a tough time or heartbreak.
Tone: gentle, understanding, and emotionally supportive.
Style: warm, reassuring, and heartfelt.
Content should provide hope, strength, and emotional comfort.
Length: Around 120-150 letters only.
Include soft supportive emojis.
Make it sound compassionate and human-like.`
};


const generateLetter = async (req, res) => {
  const { category, language } = req.body;
  if (!category || !categoryPrompt[category]) {
    return res.status(400).json({ success: false, message: 'Invalid category' });
  }
  try {
    await autoCleanup();
    const prompt = categoryPrompt[category] + `\nLanguage: ${language}`;
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    // // 3. Save to DB
    const letter = new Letter({
      content: text,
      generatedBy: 'ai',
      category: category,
      language: language
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

const getRandomLetterByCategoryAndLanguage = async (req, res) => {
  const { category, language } = req.query;
  if (!category || !categoryPrompt[category]) {
    return res.status(400).json({ success: false, message: 'Invalid category', category: category });
  }
  try {
    const letter = await getRandomLetterByCategoryAndLanguageFallback({ category, language });
    if (letter) {
      return res.status(200).json({
        success: true,
        message: 'Random Letter fetched successfully',
        letter: letter,
      });
    } else {
      return res.status(404).json({
        success: false,
        message: 'No letters found'
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// default letter 

const getDefaultLetter = async (req, res) => {
  try {
    const defaultLetter = await getDefaultLetterFallback();
    if (defaultLetter) {
      return res.status(200).json({
        success: true,
        message: 'Default Letter fetched successfully',
        letter: defaultLetter,
      });
    } else {
      return res.status(404).json({
        success: false,
        message: 'No default letter found'
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

// Helper: Fetch random letter from DB
const getRandomLetterByCategoryAndLanguageFallback = async ({ category, language }) => {
  const count = await Letter.countDocuments({ category, language });
  if (count === 0) return null;
  const random = Math.floor(Math.random() * count);
  const letter = await Letter.findOne({ category, language }).skip(random);
  return letter;
};


const getDefaultLetterFallback = async () => {
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
  getRandomLetterByCategoryAndLanguage,
  getDefaultLetter
};
