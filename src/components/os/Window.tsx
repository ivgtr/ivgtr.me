"use client";

import { useEffect, useState } from "react";
import { useDraggable } from "@/hooks/useDraggable";

interface WindowProps {
  id: string;
  title: string;
  children: React.ReactNode;
  defaultPosition?: { x: number; y: number };
  defaultSize?: { width: number | string; height?: number | string };
  isOpen?: boolean;
  isMinimized?: boolean;
  zIndex?: number;
  closable?: boolean;
  minimizable?: boolean;
  onClose?: () => void;
  onMinimize?: () => void;
  onFocus?: () => void;
}

export const Window = ({
  id,
  title,
  children,
  defaultPosition = { x: 0, y: 0 },
  defaultSize,
  isOpen = true,
  isMinimized = false,
  zIndex = 10,
  closable = true,
  minimizable = true,
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

  const { elementRef, dragHandleProps, style: dragStyle } = useDraggable({
    defaultPosition,
    disabled: isMobile,
  });

  const [visible, setVisible] = useState(isOpen && !isMinimized);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      setVisible(true);
    } else {
      const t = setTimeout(() => setVisible(false), 200);
      return () => clearTimeout(t);
    }
  }, [isOpen, isMinimized]);

  if (!visible && (!isOpen || isMinimized)) return null;

  const sizeStyle: React.CSSProperties = defaultSize
    ? {
        width: typeof defaultSize.width === "number" ? `${defaultSize.width}px` : defaultSize.width,
        height: defaultSize.height
          ? typeof defaultSize.height === "number"
            ? `${defaultSize.height}px`
            : defaultSize.height
          : undefined,
      }
    : {};

  return (
    <div
      ref={elementRef}
      className={`os-window ${isOpen && !isMinimized ? "os-window-open" : "os-window-close"}`}
      style={{
        ...dragStyle,
        ...sizeStyle,
        zIndex,
        position: isMobile ? "relative" : "absolute",
      }}
      onPointerDown={onFocus}
      data-window-id={id}
    >
      <div className="os-titlebar" {...dragHandleProps}>
        <div className="os-titlebar-buttons">
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
        </div>
        <div className="os-titlebar-title">{title}</div>
      </div>
      <div className="os-window-content">{children}</div>
    </div>
  );
};
