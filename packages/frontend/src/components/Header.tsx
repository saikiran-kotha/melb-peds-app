import React from "react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export function Header() {
  return (
    <header className="py-2 px-4 border-b bg-card text-card-foreground">
      <div className="w-full flex items-center h-14">
        <h1 className="text-sm font-medium tracking-tight">
          Melb Pedestrian Insights
        </h1>
        <div className="flex-grow"></div>
        <ThemeToggle />
      </div>
    </header>
  );
}
