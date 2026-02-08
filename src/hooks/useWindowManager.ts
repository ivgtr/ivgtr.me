"use client";

import { useReducer, useCallback } from "react";

export interface WindowState {
  id: string;
  isOpen: boolean;
  isMinimized: boolean;
  zIndex: number;
  position: { x: number; y: number };
}

type Action =
  | { type: "focus"; id: string }
  | { type: "close"; id: string }
  | { type: "minimize"; id: string }
  | { type: "restore"; id: string }
  | { type: "open"; id: string }
  | { type: "updatePosition"; id: string; position: { x: number; y: number } };

let globalZCounter = 10;

function reducer(state: WindowState[], action: Action): WindowState[] {
  switch (action.type) {
    case "focus":
      globalZCounter++;
      return state.map((w) =>
        w.id === action.id ? { ...w, zIndex: globalZCounter } : w,
      );
    case "close":
      return state.map((w) =>
        w.id === action.id ? { ...w, isOpen: false } : w,
      );
    case "minimize":
      return state.map((w) =>
        w.id === action.id ? { ...w, isMinimized: true } : w,
      );
    case "restore":
      globalZCounter++;
      return state.map((w) =>
        w.id === action.id ? { ...w, isMinimized: false, isOpen: true, zIndex: globalZCounter } : w,
      );
    case "open":
      globalZCounter++;
      return state.map((w) =>
        w.id === action.id ? { ...w, isOpen: true, isMinimized: false, zIndex: globalZCounter } : w,
      );
    case "updatePosition":
      return state.map((w) =>
        w.id === action.id ? { ...w, position: action.position } : w,
      );
    default:
      return state;
  }
}

export function useWindowManager(initialWindows: Omit<WindowState, "zIndex">[]) {
  const [windows, dispatch] = useReducer(
    reducer,
    initialWindows.map((w, i) => ({ ...w, zIndex: 10 + i })),
  );

  const focus = useCallback((id: string) => dispatch({ type: "focus", id }), []);
  const close = useCallback((id: string) => dispatch({ type: "close", id }), []);
  const minimize = useCallback((id: string) => dispatch({ type: "minimize", id }), []);
  const restore = useCallback((id: string) => dispatch({ type: "restore", id }), []);
  const open = useCallback((id: string) => dispatch({ type: "open", id }), []);

  const getWindow = useCallback(
    (id: string) => windows.find((w) => w.id === id),
    [windows],
  );

  const updatePosition = useCallback(
    (id: string, position: { x: number; y: number }) =>
      dispatch({ type: "updatePosition", id, position }),
    [],
  );

  return { windows, focus, close, minimize, restore, open, getWindow, updatePosition };
}
