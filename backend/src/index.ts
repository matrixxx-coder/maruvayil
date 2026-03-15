import express from 'express';
import cors from 'cors';
import { query } from './db.js';
import authRouter from './routes/auth.js';
import profileRouter from './routes/profile.js';
import familyRouter from './routes/family.js';
import adminRouter from './routes/admin.js';
import contentRouter from './routes/content.js';

const app = express();
const PORT = parseInt(process.env.PORT ?? '4000', 10);

// FRONTEND_URL can be a comma-separated list for multiple allowed origins
// e.g. "https://maruvayil.vercel.app,http://localhost:3000"
const rawOrigins = process.env.FRONTEND_URL;
const allowedOrigins = rawOrigins
  ? rawOrigins.split(',').map((o) => o.trim())
  : null;

app.use(
  cors({
    origin: allowedOrigins
      ? (origin, cb) => {
          // allow requests with no origin (curl, mobile apps, same-origin)
          if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
          cb(new Error(`CORS: origin ${origin} not allowed`));
        }
      : '*',
    credentials: true,
  })
);
app.use(express.json());

// Health check — tests DB connectivity too
app.get('/health', async (_req, res) => {
  try {
    await query('SELECT 1');
    res.json({ status: 'ok', db: 'ok', timestamp: new Date().toISOString() });
  } catch {
    res.status(503).json({ status: 'error', db: 'error', timestamp: new Date().toISOString() });
  }
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
