require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const { generateInsights } = require('./utils/aiService');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    aiEnabled: !!process.env.GROQ_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

app.post('/api/generate', async (req, res) => {
  const { learners } = req.body;
  if (!Array.isArray(learners)) {
    return res.status(400).json({ error: 'learners array required' });
  }

  try {
    // Process in batches of 5 to respect rate limits
    const results = [];
    const batchSize = 5;
    for (let i = 0; i < learners.length; i += batchSize) {
      const batch = learners.slice(i, i + batchSize);
      const batchResults = await Promise.all(batch.map(l => generateInsights(l)));
      results.push(...batchResults);
    }
    res.json({ results });
  } catch (err) {
    console.error('Generate error:', err);
    res.status(500).json({ error: 'Failed to generate insights' });
  }
});

app.listen(PORT, () => {
  console.log(`\n🚀 Learner Risk Copilot server running on http://localhost:${PORT}`);
  console.log(`   AI powered by Groq: ${process.env.GROQ_API_KEY ? '✓ enabled' : '✗ not configured (using fallback)'}\n`);
});
