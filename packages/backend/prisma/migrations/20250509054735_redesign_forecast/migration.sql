/*
  Warnings:

  - You are about to drop the `Prediction` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateTable
CREATE TABLE "Forecast" (
    "id" SERIAL NOT NULL,
    "sensorId" TEXT NOT NULL,
    "horizonHours" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "predictions" JSONB NOT NULL,
    "actuals" JSONB,
    "errors" JSONB,
    "evaluatedAt" TIMESTAMP(3),

    CONSTRAINT "Forecast_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Forecast_sensorId_idx" ON "Forecast"("sensorId");

-- CreateIndex
CREATE INDEX "Forecast_createdAt_idx" ON "Forecast"("createdAt");
