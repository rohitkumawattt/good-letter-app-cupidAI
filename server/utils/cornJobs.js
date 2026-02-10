import cron from 'node-cron';
import Letter from '../models/Letter.js';

export const initCronJobs = () => {
  // Yeh har 5 din mein ek baar chalega (Raat ke 12:00 baje)
  cron.schedule('0 0 */5 * *', async () => {
    console.log('--- 5-Day Storage Cleanup Started ---');
    try {
      const STORAGE_LIMIT_MB = 450; 
      const AVG_DOC_SIZE_KB = 1; // 1 document approx 1KB
      const MAX_DOCS = (STORAGE_LIMIT_MB * 1024) / AVG_DOC_SIZE_KB;

      const count = await Letter.countDocuments();

      // Check karenge agar 450MB se zyada data hai
      if (count > MAX_DOCS) {
        // 100MB worth of data delete karne ke liye (approx 100,000 docs)
        const docsToDeleteCount = Math.floor((100 * 1024) / AVG_DOC_SIZE_KB);
        
        const lettersToDelete = await Letter.find()
          .sort({ createdAt: 1 }) // Purane letters pehle
          .limit(docsToDeleteCount)
          .select('_id');

        if (lettersToDelete.length > 0) {
          const idsToDelete = lettersToDelete.map((doc) => doc._id);
          await Letter.deleteMany({ _id: { $in: idsToDelete } });
          console.log(`[Auto-Cleanup]: 100MB data deleted successfully.`);
        }
      } else {
        console.log('Storage is safe (Under 450MB). No deletion needed.');
      }
    } catch (error) {
      console.error('Cleanup Job Error:', error);
    }
  });
};