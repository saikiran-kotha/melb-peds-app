import { Router, Request, Response } from 'express';
import axios, { AxiosResponse } from 'axios';
import { PrismaClient, Forecast as ForecastModel, Prisma } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

interface ForecastRequest {
  sensorId: string;
  hours: number;
}

interface ModelPoint {
    timestamp: string;  // ISO string
    count: number;
  }

router.post('/', async (req: Request, res: Response): Promise<void> => {
  // 1. Validate inputs
  const { sensorId, hours } = req.body as Partial<ForecastRequest>;
  if (typeof sensorId !== 'string' || sensorId.trim() === '') {
    res.status(400).json({ error: '`sensorId` must be a non-empty string' });
    return;
  }
  if (typeof hours !== 'number' || !Number.isInteger(hours) || hours < 1) {
    res.status(400).json({ error: '`hours` must be an integer ≥ 1' });
    return;
  }

  try {
    // 2. Call your FastAPI model endpoint via GET
    const modelResp: AxiosResponse<ModelPoint[]> = await axios.get(
      process.env.AZURE_MODEL_URL!,
      {
        params: { sensor: sensorId, hours },
        timeout: 10_000,
      }
    );

    const predictions = modelResp.data;
    // Validate shape: array of objects, correct length
    if (
      !Array.isArray(predictions) ||
      predictions.length !== hours ||
      predictions.some(
        (pt) =>
          typeof pt.timestamp !== 'string' ||
          typeof pt.count !== 'number'
      )
    ) {
      res.status(502).json({
        error: 'Unexpected response from model API',
        details: {
          received: predictions,
          expectedLength: hours,
          expectedShape: '{ timestamp: string; count: number }[]',
        },
      });
      return;
    }

    // 3. Persist the Forecast record
    const created: ForecastModel = await prisma.forecast.create({
        data: {
          sensorId,
          horizonHours: hours,
          predictions: predictions as unknown as Prisma.InputJsonValue,
          // actuals, errors, evaluatedAt left null for later evaluation
        },
      });
  
      // 4. Return 201 Created
      res.status(201).json(created);
      return;
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error('[/forecast] error:', err.message);
      } else {
        console.error('[/forecast] unknown error:', err);
      }
      res.status(500).json({ error: 'Internal server error' });
      return;
    }
  });

export default router;

import { runSingleEvaluation } from '../jobs/evaluateForecasts.js';

router.post('/:id/evaluate', async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    res.status(400).json({ error: 'Invalid forecast id' });
    return
  }
  try {
    const updated = await runSingleEvaluation(id);
    if (!updated) {
      res.status(404).json({ error: 'Forecast not found or already evaluated' });
      return
    }
    res.json(updated);
    return
  } catch (e: unknown) {
    if (e instanceof Error) {
      console.error('[/forecast/:id/evaluate] error:', e.message);
    } else {
      console.error('[/forecast/:id/evaluate] unknown error:', e);
    }
    res.status(500).json({ error: 'Internal server error' });
    return
  }
});

