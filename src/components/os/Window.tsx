"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useDraggable } from "@/hooks/useDraggable";
import { useResizable } from "@/hooks/useResizable";

interface WindowProps {
  id: string;
  title: string;
  children: React.ReactNode;
  defaultPosition?: { x: number; y: number };
  position?: { x: number; y: number };
  defaultSize?: { width: number | string; height?: number | string };
  isOpen?: boolean;
  isMinimized?: boolean;
  zIndex?: number;
  closable?: boolean;
  minimizable?: boolean;
  resizable?: boolean;
  staggerDelay?: number;
  onClose?: () => void;
  onMinimize?: () => void;
  onFocus?: () => void;
}

export const Window = ({
  id,
  title,
  children,
  defaultPosition = { x: 0, y: 0 },
  position: controlledPosition,
  defaultSize,
  isOpen = true,
  isMinimized = false,
  zIndex = 10,
  closable = true,
  minimizable = true,
  resizable = true,
  staggerDelay = 0,
  onClose,
  onMinimize,
  onFocus,
}: WindowProps) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const { elementRef, dragHandleProps, style: dragStyle, setPosition } = useDraggable({
    defaultPosition,
    disabled: isMobile,
  });

  useEffect(() => {
    if (controlledPosition) {
      setPosition(controlledPosition);
    }
  }, [controlledPosition, setPosition]);

  const shouldEnableResize = resizable && !isMobile;

  const numericDefaultSize = useMemo(() => {
    if (!defaultSize) return { width: 400 };
    return {
      width: typeof defaultSize.width === "number" ? defaultSize.width : 400,
      height: typeof defaultSize.height === "number" ? defaultSize.height : undefined,
    };
  }, [defaultSize]);

  const { isResizing, resizeHandleProps, sizeStyle: resizeSizeStyle } = useResizable({
    defaultSize: numericDefaultSize,
    disabled: !shouldEnableResize,
  });

  const [visible, setVisible] = useState(isOpen && !isMinimized);
  const [initialStagger] = useState(staggerDelay);
  const [staggerDone, setStaggerDone] = useState(false);
  const [staggerCleared, setStaggerCleared] = useState(false);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      setVisible(true);
    } else {
      const t = setTimeout(() => setVisible(false), 200);
      return () => clearTimeout(t);
    }
  }, [isOpen, isMinimized]);

  useEffect(() => {
    if (!isOpen || isMinimized) {
      if (!staggerCleared && initialStagger > 0) {
        setStaggerCleared(true);
        setStaggerDone(false);
      }
    }
  }, [isOpen, isMinimized, staggerCleared, initialStagger]);

  const handleAnimationEnd = useCallback((e: React.AnimationEvent) => {
    if (e.currentTarget === e.target && e.animationName === "os-window-stagger-in") {
      setStaggerDone(true);
    }
  }, []);

  if (!visible && (!isOpen || isMinimized)) return null;

  const sizeStyle: React.CSSProperties = shouldEnableResize
    ? resizeSizeStyle
    : defaultSize
      ? {
          width: typeof defaultSize.width === "number" ? `${defaultSize.width}px` : defaultSize.width,
          height: defaultSize.height
            ? typeof defaultSize.height === "number"
              ? `${defaultSize.height}px`
              : defaultSize.height
            : undefined,
        }
      : {};

  const effectiveStagger = staggerCleared ? 0 : initialStagger;
  const useStagger = effectiveStagger > 0 && !staggerDone && isOpen && !isMinimized;

  const windowClassName = [
    "os-window",
    useStagger
      ? "os-window-stagger-in"
      : isOpen && !isMinimized
        ? (staggerDone ? "" : "os-window-open")
        : "os-window-close",
  ].join(" ");

  return (
    <div
      ref={elementRef}
      className={windowClassName}
      style={{
        ...dragStyle,
        ...sizeStyle,
        zIndex,
        position: isMobile ? "relative" : "absolute",
        ...(isResizing ? { userSelect: "none" } : undefined),
        ...(useStagger ? { animationDelay: `${effectiveStagger}ms` } : undefined),
      }}
      onPointerDown={onFocus}
      onAnimationEnd={handleAnimationEnd}
      data-window-id={id}
    >
      <div className="os-titlebar" {...dragHandleProps}>
        <div className="os-titlebar-buttons">
          {closable && (
            <button
              className="os-titlebar-btn os-titlebar-btn-close"
              onClick={(e) => {
                e.stopPropagation();
                onClose?.();
              }}
              aria-label="閉じる"
            >
              <span>&times;</span>
            </button>
          )}
          {minimizable && (
            <button
              className="os-titlebar-btn os-titlebar-btn-minimize"
              onClick={(e) => {
                e.stopPropagation();
                onMinimize?.();
              }}
              aria-label="最小化"
            >
              <span>_</span>
            </button>
          )}
        </div>
        <div className="os-titlebar-title">{title}</div>
      </div>
      <div className="os-window-content" style={isResizing ? { pointerEvents: "none" } : undefined}>
        {children}
      </div>
      {shouldEnableResize && (
        <>
          <div className="os-resize-handle os-resize-handle-e" {...resizeHandleProps("e")} />
          <div className="os-resize-handle os-resize-handle-s" {...resizeHandleProps("s")} />
          <div className="os-resize-handle os-resize-handle-se" {...resizeHandleProps("se")} />
        </>
      )}
    </div>
  );
};
