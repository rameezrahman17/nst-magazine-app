import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import multer from 'multer';

dotenv.config();

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

// Supabase Setup
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const googleClient = new OAuth2Client(process.env.VITE_GOOGLE_CLIENT_ID);

app.use(cors({
  origin: [
    'https://nst-magazine-app.vercel.app',
    'http://localhost:5173',
    'http://localhost:4173'
  ],
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Request logger
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// --- ROUTES ---

// 1. Google Auth Verify
app.post('/api/auth/google', async (req, res) => {
  const { credential } = req.body;
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.VITE_GOOGLE_CLIENT_ID
    });
    const payload = ticket.getPayload();

    const token = jwt.sign(
      {
        email: payload.email,
        name: payload.name,
        picture: payload.picture
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 24 * 60 * 60 * 1000
    });

    res.json({
      success: true,
      user: {
        email: payload.email,
        name: payload.name
      }
    });
  } catch (error) {
    console.error('Google Auth Error:', error);
    res.status(401).json({ success: false, message: 'Invalid Google Token' });
  }
});

// 2. Volunteers
app.get('/api/volunteers', async (req, res) => {
  const { data, error } = await supabase.from('volunteers').select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post('/api/volunteers', async (req, res) => {
  const { name, email, campus, year, contribution } = req.body;
  const { data, error } = await supabase.from('volunteers').insert([{ name, email, campus, year, contribution }]);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true, data });
});

// 3. Submissions with Multi-Image Support
app.post('/api/submissions', upload.array('images'), async (req, res) => {
  try {
    const { campus, email, category, name, year, description, project_link, github_link } = req.body;
    const files = req.files || [];
    let imageUrls = [];

    for (const file of files) {
      const fileName = `${Date.now()}-${file.originalname}`;
      const filePath = `${category}/${fileName}`;

      const { data, error: uploadError } = await supabase.storage
        .from('magazine_uploads')
        .upload(filePath, file.buffer, {
          contentType: file.mimetype
        });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('magazine_uploads')
        .getPublicUrl(filePath);

      imageUrls.push(publicUrlData.publicUrl);
    }

    const { data, error: dbError } = await supabase.from('magazine_submissions').insert([{
      campus, email, category, name, year, description, project_link, github_link, images: imageUrls
    }]);

    if (dbError) throw dbError;
    res.json({ success: true, data });
  } catch (error) {
    console.error('Submission Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 4. Logout
app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: true,
    sameSite: 'none'
  });
  res.json({ success: true });
});

// IMPORTANT: Do NOT call app.listen() here.
// Vercel handles the server lifecycle.
export default app;
