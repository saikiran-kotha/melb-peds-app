import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Area,
  AreaChart,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";

const MOCK_DATA = [
  { timestamp: "09:00", error: 5 },
  { timestamp: "10:00", error: 3 },
  { timestamp: "11:00", error: 7 },
  { timestamp: "12:00", error: 2 },
  { timestamp: "13:00", error: 6 },
];

const PERFORMANCE_DATA = [
  { period: "Morning", accuracy: 85, speed: 90 },
  { period: "Afternoon", accuracy: 78, speed: 95 },
  { period: "Evening", accuracy: 92, speed: 88 },
];

const PEDESTRIAN_DATA = [
  { time: "08:00", bourke: 120, flinders: 250, southbank: 80 },
  { time: "10:00", bourke: 240, flinders: 380, southbank: 150 },
  { time: "12:00", bourke: 350, flinders: 420, southbank: 220 },
  { time: "14:00", bourke: 410, flinders: 520, southbank: 280 },
  { time: "16:00", bourke: 490, flinders: 650, southbank: 340 },
  { time: "18:00", bourke: 380, flinders: 700, southbank: 360 },
  { time: "20:00", bourke: 260, flinders: 580, southbank: 290 },
];

// Define chart configuration for theming
const chartConfig: ChartConfig = {
  error: {
    label: "Error Value",
    color: "hsl(var(--chart-1))",
  },
};

// Performance chart config
const performanceChartConfig: ChartConfig = {
  accuracy: {
    label: "Accuracy",
    color: "hsl(var(--chart-2))",
  },
  speed: {
    label: "Speed",
    color: "hsl(var(--chart-3))",
  },
};

// Pedestrian count chart config
const pedestrianChartConfig: ChartConfig = {
  bourke: {
    label: "Bourke Street",
    color: "hsl(var(--chart-1))",
  },
  flinders: {
    label: "Flinders Street",
    color: "hsl(var(--chart-4))",
  },
  southbank: {
    label: "Southbank",
    color: "hsl(var(--chart-5))",
  },
};

const DashboardView: React.FC = () => {
  const [data] = useState(MOCK_DATA);
  const [performanceData] = useState(PERFORMANCE_DATA);
  const [pedestrianData] = useState(PEDESTRIAN_DATA);

  // TODO: Implement actual data fetching for refresh
  const handleRefresh = () => {
    console.log("Refresh clicked");
    // Example: setData(fetchNewData());
  };

  return (
    <div className="w-full h-full p-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card className="h-full flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Model Error Over Time</CardTitle>
            <CardDescription>
              Shows the trend of model prediction errors.
            </CardDescription>
          </div>
          <Button onClick={handleRefresh}>Refresh</Button>
        </CardHeader>
        <CardContent className="flex-1 pt-2">
          <ChartContainer config={chartConfig} className="h-full w-full">
            <LineChart accessibilityLayer data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="timestamp"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
              />
              <YAxis tickLine={false} tickMargin={10} axisLine={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line
                type="monotone"
                dataKey="error"
                stroke="var(--color-chart-1)"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="h-full flex flex-col">
        <CardHeader>
          <CardTitle>Model Performance</CardTitle>
          <CardDescription>
            Accuracy and speed metrics by time period
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 pt-2">
          <ChartContainer
            config={performanceChartConfig}
            className="h-full w-full"
          >
            <BarChart accessibilityLayer data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="period"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
              />
              <YAxis tickLine={false} tickMargin={10} axisLine={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar dataKey="accuracy" fill="var(--color-chart-2)" radius={4} />
              <Bar dataKey="speed" fill="var(--color-chart-3)" radius={4} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="h-full flex flex-col lg:col-span-2">
        <CardHeader>
          <CardTitle>Pedestrian Counts</CardTitle>
          <CardDescription>
            Hourly pedestrian counts at key Melbourne locations
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 pt-2">
          <ChartContainer
            config={pedestrianChartConfig}
            className="h-full w-full"
          >
            <AreaChart accessibilityLayer data={pedestrianData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="time"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
              />
              <YAxis tickLine={false} tickMargin={10} axisLine={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Area
                type="monotone"
                dataKey="bourke"
                stroke="var(--color-chart-1)"
                fill="var(--color-chart-1)"
                fillOpacity={0.2}
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="flinders"
                stroke="var(--color-chart-4)"
                fill="var(--color-chart-4)"
                fillOpacity={0.2}
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="southbank"
                stroke="var(--color-chart-5)"
                fill="var(--color-chart-5)"
                fillOpacity={0.2}
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardView;
