// src/components/Layout.tsx
import React from "react";
import MapView from "./MapView";
import DashboardView from "./DashboardView";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "./Header";

export default function Layout() {
  return (
    <div className="flex flex-col h-screen w-screen bg-background text-foreground">
      <Header />
      <div className="flex flex-1 p-4 gap-4 overflow-hidden">
        {/* Left Side: Map View in a Card */}
        <Card className="w-1/2 h-full flex flex-col overflow-hidden">
          <CardHeader>
            <CardTitle>Map View</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 p-0">
            {/* MapView should fill this space */}
            <MapView />
          </CardContent>
        </Card>

        {/* Right Side: Dashboard View in a Card */}
        <Card className="w-1/2 h-full flex flex-col overflow-hidden">
          <CardHeader>
            <CardTitle>Dashboard</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 p-4">
            {/* DashboardView should ideally fill this space */}
            <DashboardView />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
