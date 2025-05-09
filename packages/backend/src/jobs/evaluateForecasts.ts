// packages/backend/src/jobs/evaluateForecasts.ts

import axios from 'axios';
import { PrismaClient, Prisma } from '@prisma/client';
import cron from 'node-cron';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';

console.log('[Job ENV] Loaded CITY_API_URL:', process.env.CITY_API_URL);
console.log('[Job ENV] Loaded CITY_API_KEY:', process.env.CITY_API_KEY);

dayjs.extend(utc);
dayjs.extend(timezone);

const prisma = new PrismaClient();
const CITY_API_URL = process.env.CITY_API_URL!;
const CITY_API_KEY = process.env.CITY_API_KEY!;

interface ForecastPoint {
  forecastId: number;
  sensorId: string;
  timestamp: string;
  predicted: number;
  index: number;
}

export async function runSingleEvaluation(forecastId: number) {
    const prisma = new PrismaClient();
    const fc = await prisma.forecast.findUnique({ where: { id: forecastId } });
    if (!fc || fc.actuals !== null) return null;
  
    // Re-use your existing logic for a single Forecast:
    const predictions = fc.predictions as { timestamp: string; count: number }[];
    const actuals: number[] = [], errors: number[] = [];
  
    for (let i = 0; i < predictions.length; i++) {
      const pt = predictions[i];
      const m = dayjs(pt.timestamp).tz('Australia/Melbourne');
      const where = [
        `sensing_date=date'${m.format('YYYY-MM-DD')}'`,
        `hourday=${m.hour()}`,
        `sensor_name='${fc.sensorId}'`
      ].join(' AND ');

      console.log(`[Job Eval Single] Querying City API with where: ${where}`);

      const headers: Record<string, string> = {};
      if (CITY_API_KEY) {
        headers['X-App-Token'] = CITY_API_KEY;
      }

      // Fetch actuals from City API
      const resp = await axios.get(CITY_API_URL, {
        params: { where: where, limit: 1 },
        headers: headers 
      });

      console.log('[Job Eval Single] City API raw response data:', JSON.stringify(resp.data, null, 2));

      // THIS IS THE CRITICAL PART for actuals
      const actual = resp.data.results?.[0]?.pedestriancount ?? 0;
      console.log(`[Job Eval Single] Derived actual: ${actual} for timestamp ${pt.timestamp}`);

      actuals.push(actual);
      errors.push(Math.abs(pt.count - actual));
    }
  
    return prisma.forecast.update({
      where: { id: forecastId },
      data: { actuals, errors, evaluatedAt: new Date() }
    });
  }
  
  
// Core evaluation logic
export async function runEvaluationJob() {
  console.log('[Job] Starting evaluation:', new Date().toISOString());

  // 1. Load all forecasts >24h old without actuals
  const cutoff = dayjs().tz('Australia/Melbourne').subtract(24, 'hour').toDate();
  const nowMelb = dayjs().tz('Australia/Melbourne');

  console.log('[Job] Now (AEST):      ', nowMelb.format());
  console.log('[Job] Cutoff (AEST-24h):', cutoff.toISOString());

  const pending = await prisma.forecast.findMany({
    where: { actuals: { equals: Prisma.JsonNull }, createdAt: { lt: cutoff } },
  });

  // *** NEW: dump the raw pending rows ***
  console.log('[Job] Pending rows raw:', pending);

  if (pending.length === 0) {
    console.log('[Job] No forecasts to evaluate');
    return;
  }

  if (pending.length === 0) {
    console.log('[Job] No forecasts to evaluate');
    return;
  }
  console.log(`[Job] Evaluating ${pending.length} forecasts`);

  // 2. Build a flat list of points and init update buffers
  const points: ForecastPoint[] = [];
  const updates: Record<number, { actuals: number[]; errors: number[] }> = {};
  for (const fc of pending) {
    const preds = fc.predictions as { timestamp: string; count: number }[];
    updates[fc.id] = {
      actuals: Array(preds.length).fill(0),
      errors:  Array(preds.length).fill(0),
    };
    preds.forEach((pt, idx) =>
      points.push({
        forecastId: fc.id,
        sensorId:   fc.sensorId,
        timestamp:  pt.timestamp,
        predicted:  pt.count,
        index:      idx,
      })
    );
  }

  // 3. Group by unique timestamps and fetch actuals in bulk per timestamp
  const timestamps = Array.from(new Set(points.map(p => p.timestamp)));
  for (const ts of timestamps) {
    const m = dayjs(ts).tz('Australia/Melbourne');
    const dateStr = m.format('YYYY-MM-DD');
    const hour    = m.hour();

    // Sensors predicted at this ts
    const sensorsAtTs = Array.from(new Set(
      points.filter(p => p.timestamp === ts).map(p => p.sensorId)
    ));
    const whereClause = [
      `sensing_date=date'${dateStr}'`,
      `hourday=${hour}`,
      `sensor_name IN (${sensorsAtTs.map(s => `'${s}'`).join(',')})`
    ].join(' AND ');

    console.log(`[Job Eval Bulk] Querying City API with where: ${whereClause}`);

    const headers: Record<string, string> = {};
    if (CITY_API_KEY) {
      headers['X-App-Token'] = CITY_API_KEY;
    }

    // Fetch all sensor counts for this timestamp
    const resp = await axios.get(CITY_API_URL, {
      params: { where: whereClause, limit: sensorsAtTs.length },
      headers: headers,
      timeout: 10_000,
    });
    const results: any[] = resp.data.results;
    const actualMap = new Map<string, number>();
    results.forEach(r => actualMap.set(r.sensor_name, r.pedestriancount));

    // 4. Populate updates for each point at this ts
    points
      .filter(p => p.timestamp === ts)
      .forEach(p => {
        const actual = actualMap.get(p.sensorId) ?? 0;
        updates[p.forecastId].actuals[p.index] = actual;
        updates[p.forecastId].errors[p.index]  = Math.abs(p.predicted - actual);
      });
  }

  // 5. Persist back into the DB
  for (const fc of pending) {
    const { actuals, errors } = updates[fc.id];
    try {
      await prisma.forecast.update({
        where: { id: fc.id },
        data: {
          actuals,
          errors,
          evaluatedAt: new Date(),
        },
      });
      console.log(`[Job] Forecast ${fc.id} evaluated`);
    } catch (e) {
      console.error(`[Job] Failed to update ${fc.id}:`, e);
    }
  }

  console.log('[Job] Evaluation complete');
}

// Schedule daily at 00:05 Melbourne time
export function scheduleEvaluationJob() {
  cron.schedule(
    '5 0 * * *',
    () => runEvaluationJob().catch((err: unknown) => {
      if (err instanceof Error) {
        console.error('[Job] Fatal error during evaluation job:', err.message);
      } else {
        console.error('[Job] Fatal unknown error during evaluation job:', err);
      }
    }),
    { timezone: 'Australia/Melbourne' }
  );
}
