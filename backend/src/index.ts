import express from 'express';
import cors from 'cors';
import authRouter from './routes/auth.js';
import profileRouter from './routes/profile.js';
import familyRouter from './routes/family.js';
import adminRouter from './routes/admin.js';
import contentRouter from './routes/content.js';

const app = express();
const PORT = parseInt(process.env.PORT ?? '4000', 10);
const FRONTEND_URL = process.env.FRONTEND_URL;

app.use(
  cors({
    origin: FRONTEND_URL ?? '*',
    credentials: true,
  })
);
app.use(express.json());

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Routes
app.use('/auth', authRouter);
app.use('/profile', profileRouter);
app.use('/family-members', familyRouter);
app.use('/admin', adminRouter);
app.use('/content', contentRouter);

app.listen(PORT, () => {
  console.log(`Backend listening on port ${PORT}`);
});
