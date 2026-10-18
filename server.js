import express from 'express';
import { generateListing, getOllamaStatus } from './src/ai.js';

const app = express();
app.use(express.json({ limit: '29mb' }));
app.get('/api/status', async (_req, res) => res.json(await getOllamaStatus()));
let generating = false;
app.post('/api/generate', async (req, res) => {
  if (generating) return res.status(429).json({ error: 'The local model is busy. Please try again shortly.' });
  generating = true;
  try { res.json(await generateListing(req.body)); }
  catch (error) { res.status(error.status || 502).json({ error: error.message }); }
  finally { generating = false; }
});
app.use((error, _req, res, next) => {
  if (error.type === 'entity.too.large') return res.status(413).json({ error: 'Photos are too large. Use up to four images under 5 MB each.' });
  if (error instanceof SyntaxError) return res.status(400).json({ error: 'Invalid request body.' });
  next(error);
});
app.use('/fonts/dm-sans', express.static('node_modules/@fontsource/dm-sans/files'));
app.use('/fonts/manrope', express.static('node_modules/@fontsource/manrope/files'));
app.use('/vendor', express.static('node_modules/lucide/dist/umd'));
app.use(express.static('public'));
app.listen(process.env.PORT || 3000, '0.0.0.0', () => console.log('Snaplist running on port ' + (process.env.PORT || 3000)));
