"use client";

import { useCallback, useRef, useState } from "react";

interface Size {
  width: number;
  height: number | undefined;
}

interface UseResizableOptions {
  defaultSize: { width: number; height?: number };
  minSize?: { width: number; height: number };
  disabled?: boolean;
}

type ResizeDirection = "e" | "s" | "se";

export function useResizable({
  defaultSize,
  minSize = { width: 200, height: 100 },
  disabled = false,
}: UseResizableOptions) {
  const [size, setSize] = useState<Size>({
    width: defaultSize.width,
    height: defaultSize.height,
  });
  const isResizing = useRef(false);
  const [isResizingState, setIsResizingState] = useState(false);
  const directionRef = useRef<ResizeDirection>("se");
  const startPos = useRef({ x: 0, y: 0 });
  const startSize = useRef<Size>({ width: 0, height: undefined });

  const handlePointerDown = useCallback(
    (direction: ResizeDirection) => (e: React.PointerEvent) => {
      if (disabled) return;
      e.stopPropagation();
      isResizing.current = true;
      setIsResizingState(true);
      directionRef.current = direction;
      startPos.current = { x: e.clientX, y: e.clientY };
      startSize.current = { width: size.width, height: size.height };
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [disabled, size],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isResizing.current) return;
      const dx = e.clientX - startPos.current.x;
      const dy = e.clientY - startPos.current.y;
      const dir = directionRef.current;

      setSize((prev) => {
        const newSize = { ...prev };
        if (dir === "e" || dir === "se") {
          newSize.width = Math.max(minSize.width, (startSize.current.width) + dx);
        }
        if (dir === "s" || dir === "se") {
          const startH = startSize.current.height ?? 0;
          if (startH > 0) {
            newSize.height = Math.max(minSize.height, startH + dy);
          }
        }
        return newSize;
      });
    },
    [minSize],
  );

  const handlePointerUp = useCallback(() => {
    isResizing.current = false;
    setIsResizingState(false);
  }, []);

  const resizeHandleProps = useCallback(
    (direction: ResizeDirection) =>
      disabled
        ? {}
        : {
            onPointerDown: handlePointerDown(direction),
            onPointerMove: handlePointerMove,
            onPointerUp: handlePointerUp,
          },
    [disabled, handlePointerDown, handlePointerMove, handlePointerUp],
  );

  const sizeStyle: React.CSSProperties = {
    width: `${size.width}px`,
    height: size.height != null ? `${size.height}px` : undefined,
  };

  return {
    size,
    isResizing: isResizingState,
    resizeHandleProps,
    sizeStyle,
  };
}
