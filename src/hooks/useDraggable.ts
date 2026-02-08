"use client";

import { useCallback, useRef, useState } from "react";

interface Position {
  x: number;
  y: number;
}

interface UseDraggableOptions {
  defaultPosition?: Position;
  disabled?: boolean;
}

export function useDraggable({ defaultPosition = { x: 0, y: 0 }, disabled = false }: UseDraggableOptions = {}) {
  const [position, setPosition] = useState<Position>(defaultPosition);
  const isDragging = useRef(false);
  const dragStart = useRef<Position>({ x: 0, y: 0 });
  const elementRef = useRef<HTMLDivElement>(null);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (disabled) return;
      isDragging.current = true;
      dragStart.current = {
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      };
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [disabled, position],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging.current) return;
      let newX = e.clientX - dragStart.current.x;
      let newY = e.clientY - dragStart.current.y;

      newY = Math.max(0, newY);

      setPosition({ x: newX, y: newY });
    },
    [],
  );

  const handlePointerUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  return {
    position,
    setPosition,
    elementRef,
    dragHandleProps: disabled
      ? {}
      : {
          onPointerDown: handlePointerDown,
          onPointerMove: handlePointerMove,
          onPointerUp: handlePointerUp,
          style: { cursor: "grab", touchAction: "none" } as React.CSSProperties,
        },
    style: disabled
      ? {}
      : ({
          left: `${position.x}px`,
          top: `${position.y}px`,
        } as React.CSSProperties),
  };
}
