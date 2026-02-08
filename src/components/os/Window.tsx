"use client";

import { useEffect, useMemo, useState } from "react";
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

  useEffect(() => {
    if (isOpen && !isMinimized) {
      setVisible(true);
    } else {
      const t = setTimeout(() => setVisible(false), 200);
      return () => clearTimeout(t);
    }
  }, [isOpen, isMinimized]);

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

  return (
    <div
      ref={elementRef}
      className={`os-window ${isOpen && !isMinimized ? "os-window-open" : "os-window-close"}`}
      style={{
        ...dragStyle,
        ...sizeStyle,
        zIndex,
        position: isMobile ? "relative" : "absolute",
        ...(isResizing ? { userSelect: "none" } : undefined),
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
