"use client";

import { RetroVisitorCounter } from "@/components/retro/RetroVisitorCounter";

interface MinimizedWindow {
  id: string;
  title: string;
  onRestore: () => void;
}

interface StatusBarProps {
  minimizedWindows?: MinimizedWindow[];
}

export const StatusBar = ({ minimizedWindows = [] }: StatusBarProps) => {
  return (
    <div className="os-statusbar">
      <div className="os-statusbar-left">
        <span className="os-statusbar-indicator" />
        <span>Connection: OK</span>
      </div>
      <div className="os-statusbar-center">
        {minimizedWindows.map((w) => (
          <button
            key={w.id}
            className="os-statusbar-window-btn"
            onClick={w.onRestore}
          >
            {w.title}
          </button>
        ))}
      </div>
      <div className="os-statusbar-right">
        <RetroVisitorCounter />
      </div>
    </div>
  );
};
