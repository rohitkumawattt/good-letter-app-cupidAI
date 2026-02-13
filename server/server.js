import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import letterRoutes from './routes/letterRoutes.js';
import { initCronJobs } from './utils/cornJobs.js';

dotenv.config();

connectDB();

const app = express();

const corsOptions = {
  origin: ['http://localhost:5173',"https://cupid-ai-dun.vercel.app"],
  methods: ['GET', 'POST'],
};
app.use(cors(corsOptions));
app.use(express.json());

app.use('/api/letters', letterRoutes);

initCronJobs();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
