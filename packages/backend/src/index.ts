import express from 'express';
import dotenv from 'dotenv';
import forecastRouter from './routes/forecast.js';
import { scheduleEvaluationJob } from './jobs/evaluateForecasts.js';

dotenv.config();
const app = express();
app.use(express.json());

// Health-check (already there)
app.get('/health', (_req, res) => {
  res.json({ status: 'OK' });
});

// Forecast ingestion
app.use('/forecast', forecastRouter);

// Start scheduler
scheduleEvaluationJob();

// Start server…
const PORT = parseInt(process.env.PORT || '4000', 10);
app.listen(PORT, () =>
  console.log(`Backend listening on http://localhost:${PORT}`)
);
