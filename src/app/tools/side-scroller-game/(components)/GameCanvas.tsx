"use client";

import { useEffect, useRef, useState } from "react";
import type { GameState } from "./useGameEngine";
import { GAME_CONSTANTS, THEME_COLORS } from "./constants";

interface GameCanvasProps {
  gameState: GameState;
}


interface CanvasDimensions {
  width: number;
  height: number;
}


export const GameCanvas = ({ gameState }: GameCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvasDimensions, setCanvasDimensions] = useState<CanvasDimensions>({
    width: GAME_CONSTANTS.CANVAS_WIDTH,
    height: GAME_CONSTANTS.CANVAS_HEIGHT,
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateCanvasSize = () => {
      const containerWidth = container.clientWidth;
      const aspectRatio = GAME_CONSTANTS.CANVAS_WIDTH / GAME_CONSTANTS.CANVAS_HEIGHT;

      if (containerWidth < GAME_CONSTANTS.CANVAS_WIDTH) {
        const width = containerWidth;
        const height = width / aspectRatio;
        setCanvasDimensions({ width, height });
      } else {
        setCanvasDimensions({ width: GAME_CONSTANTS.CANVAS_WIDTH, height: GAME_CONSTANTS.CANVAS_HEIGHT });
      }
    };

    const observer = new ResizeObserver(() => {
      updateCanvasSize();
    });
    observer.observe(container);
    updateCanvasSize();

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      console.error("Failed to get 2D canvas context");
      return;
    }

    // Clear canvas
    ctx.clearRect(0, 0, canvasDimensions.width, canvasDimensions.height);

    // Draw theme-based background
    const backgroundColor = getBackgroundColor(gameState.currentTheme);
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvasDimensions.width, canvasDimensions.height);
    
    function getBackgroundColor(theme: string): string {
      return THEME_COLORS.backgrounds[theme as keyof typeof THEME_COLORS.backgrounds] || THEME_COLORS.backgrounds.forest;
    }

    // Draw theme-based ground
    const groundColor = gameState.groundColor;
    ctx.fillStyle = groundColor;
    
    // Calculate viewport and scale
    const viewportX = gameState.camera.x;
    const scaleX = canvasDimensions.width / GAME_CONSTANTS.CANVAS_WIDTH;
    const scaleY = canvasDimensions.height / GAME_CONSTANTS.CANVAS_HEIGHT;
    
    // Draw background elements (simple objects, no parallax) - optimized viewport culling
    const leftBound = viewportX - 200;
    const rightBound = viewportX + canvasDimensions.width / scaleX + 200;
    
    gameState.backgroundElements.forEach((element) => {
      // Early viewport culling for better performance
      if (element.x < leftBound || element.x > rightBound) return;
      
      const screenX = (element.x - viewportX) * scaleX;
      const scaledSize = element.scale * Math.min(scaleX, scaleY);
      
      const getColor = (type: string, theme: string): string => {
        return THEME_COLORS.elements[theme as keyof typeof THEME_COLORS.elements]?.[type as keyof (typeof THEME_COLORS.elements)[keyof typeof THEME_COLORS.elements]] || "#8B4513";
      };
      const color = element.color || getColor(element.type, gameState.currentTheme);
      ctx.fillStyle = color;
      
      switch (element.type) {
        case 'tree':
          ctx.fillStyle = "#8B4513";
          ctx.fillRect(screenX, element.y * scaleY, 8 * scaledSize, 25 * scaledSize);
          ctx.fillStyle = color;
          ctx.fillRect(screenX - 10 * scaledSize, element.y * scaleY - 15 * scaledSize, 28 * scaledSize, 20 * scaledSize);
          break;
          
        case 'bush':
          ctx.fillStyle = color;
          ctx.fillRect(screenX, element.y * scaleY, 20 * scaledSize, 12 * scaledSize);
          break;
          
        case 'rock':
          ctx.fillStyle = color;
          ctx.fillRect(screenX, element.y * scaleY, 15 * scaledSize, 10 * scaledSize);
          break;
          
        case 'mountain':
          ctx.fillStyle = color;
          ctx.fillRect(screenX, element.y * scaleY, 40 * scaledSize, 30 * scaledSize);
          break;
          
        case 'building':
          ctx.fillStyle = color;
          ctx.fillRect(screenX, element.y * scaleY, 25 * scaledSize, 50 * scaledSize);
          break;
          
        case 'cloud':
          ctx.fillStyle = color;
          ctx.fillRect(screenX, element.y * scaleY, 30 * scaledSize, 15 * scaledSize);
          break;
          
        case 'flower':
          ctx.fillStyle = color;
          ctx.fillRect(screenX, element.y * scaleY, 6 * scaledSize, 6 * scaledSize);
          break;
          
        case 'cactus':
          ctx.fillStyle = color;
          ctx.fillRect(screenX, element.y * scaleY, 8 * scaledSize, 25 * scaledSize);
          ctx.fillRect(screenX - 3 * scaledSize, element.y * scaleY + 8 * scaledSize, 6 * scaledSize, 4 * scaledSize);
          ctx.fillRect(screenX + 5 * scaledSize, element.y * scaleY + 12 * scaledSize, 6 * scaledSize, 4 * scaledSize);
          break;
          
        case 'crystal':
          ctx.fillStyle = color;
          ctx.fillRect(screenX, element.y * scaleY, 12 * scaledSize, 18 * scaledSize);
          break;
          
        case 'antenna':
          ctx.fillStyle = color;
          ctx.fillRect(screenX, element.y * scaleY, 4 * scaledSize, 40 * scaledSize);
          ctx.fillRect(screenX - 2 * scaledSize, element.y * scaleY, 8 * scaledSize, 4 * scaledSize);
          break;
          
        case 'pole':
          ctx.fillStyle = color;
          ctx.fillRect(screenX, element.y * scaleY, 6 * scaledSize, 30 * scaledSize);
          break;
          
        case 'sign':
          ctx.fillStyle = color;
          ctx.fillRect(screenX, element.y * scaleY, 20 * scaledSize, 12 * scaledSize);
          ctx.fillStyle = "#8B4513";
          ctx.fillRect(screenX + 8 * scaledSize, element.y * scaleY + 12 * scaledSize, 4 * scaledSize, 15 * scaledSize);
          break;
      }
    });
    
    // Reset fillStyle to ground color after drawing background elements
    ctx.fillStyle = groundColor;
    
    // Draw ground segments (avoiding pits)
    let groundX = 0;
    const extendedWidth = canvasDimensions.width + 200;
    
    // Sort pits by x position for easier processing
    const visiblePits = gameState.pits
      .filter(pit => pit.x + pit.width > viewportX - 100 && pit.x < viewportX + extendedWidth)
      .sort((a, b) => a.x - b.x);
    
    // Draw ground segments between pits
    visiblePits.forEach((pit) => {
      const pitScreenX = pit.x - viewportX;
      
      // Draw ground before this pit
      if (pitScreenX > groundX) {
        ctx.fillRect(groundX, GAME_CONSTANTS.GROUND_Y * scaleY, pitScreenX - groundX, canvasDimensions.height - GAME_CONSTANTS.GROUND_Y * scaleY);
      }
      
      // Draw pit edges (darker ground)
      ctx.fillStyle = "#1A5F1A";
      ctx.fillRect(pitScreenX - 5 * scaleX, GAME_CONSTANTS.GROUND_Y * scaleY, 5 * scaleX, GAME_CONSTANTS.PIT_DEPTH * scaleY);
      ctx.fillRect(pitScreenX + pit.width * scaleX, GAME_CONSTANTS.GROUND_Y * scaleY, 5 * scaleX, GAME_CONSTANTS.PIT_DEPTH * scaleY);
      
      // Draw warning signs (small triangles)
      ctx.fillStyle = "#FFD700";
      ctx.beginPath();
      ctx.moveTo(pitScreenX + 10 * scaleX, GAME_CONSTANTS.GROUND_Y * scaleY - 10 * scaleY);
      ctx.lineTo(pitScreenX + 20 * scaleX, GAME_CONSTANTS.GROUND_Y * scaleY - 30 * scaleY);
      ctx.lineTo(pitScreenX + 30 * scaleX, GAME_CONSTANTS.GROUND_Y * scaleY - 10 * scaleY);
      ctx.closePath();
      ctx.fill();
      
      // Draw exclamation mark
      ctx.fillStyle = "#000000";
      ctx.font = `bold ${16 * Math.min(scaleX, scaleY)}px Arial`;
      ctx.fillText("!", pitScreenX + 17 * scaleX, GAME_CONSTANTS.GROUND_Y * scaleY - 15 * scaleY);
      
      // Reset for next segment
      ctx.fillStyle = groundColor;
      groundX = pitScreenX + pit.width;
    });
    
    // Draw remaining ground after last pit
    if (groundX < canvasDimensions.width) {
      ctx.fillRect(groundX, GAME_CONSTANTS.GROUND_Y * scaleY, canvasDimensions.width - groundX, canvasDimensions.height - GAME_CONSTANTS.GROUND_Y * scaleY);
    }

    // Draw obstacles with different styles based on type
    gameState.obstacles.forEach((obstacle) => {
      const screenX = (obstacle.x - viewportX) * scaleX;
      if (screenX > -obstacle.width * scaleX && screenX < canvasDimensions.width) {
        // Set color based on obstacle type
        switch (obstacle.type) {
          case 'spike':
            ctx.fillStyle = "#8B0000";
            break;
          case 'tall':
            ctx.fillStyle = "#556B2F";
            break;
          case 'wide':
            ctx.fillStyle = "#A0522D";
            break;
          default:
            ctx.fillStyle = "#8B4513";
        }
        
        ctx.fillRect(screenX, obstacle.y * scaleY, obstacle.width * scaleX, obstacle.height * scaleY);
        
        // Add special effects for spike obstacles
        if (obstacle.type === 'spike') {
          ctx.fillStyle = "#FF0000";
          // Draw spiky top
          ctx.beginPath();
          const spikes = 3;
          const spikeWidth = (obstacle.width * scaleX) / spikes;
          for (let i = 0; i < spikes; i++) {
            const x1 = screenX + i * spikeWidth;
            const x2 = screenX + (i + 0.5) * spikeWidth;
            const x3 = screenX + (i + 1) * spikeWidth;
            const y1 = obstacle.y * scaleY;
            const y2 = (obstacle.y - 10) * scaleY;
            
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.lineTo(x3, y1);
          }
          ctx.fill();
        }
      }
    });

    // Draw player
    const playerScreenX = (gameState.player.x - viewportX) * scaleX;
    ctx.fillStyle = gameState.gameOver ? "#FF0000" : "#FF6B6B";
    ctx.fillRect(playerScreenX, gameState.player.y * scaleY, GAME_CONSTANTS.PLAYER_SIZE * scaleX, GAME_CONSTANTS.PLAYER_SIZE * scaleY);

    // Draw player outline
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 2 * Math.min(scaleX, scaleY);
    ctx.strokeRect(playerScreenX, gameState.player.y * scaleY, GAME_CONSTANTS.PLAYER_SIZE * scaleX, GAME_CONSTANTS.PLAYER_SIZE * scaleY);
  }, [gameState, canvasDimensions]);

  return (
    <div ref={containerRef} style={{ width: "100%" }}>
      <canvas
        ref={canvasRef}
        width={canvasDimensions.width}
        height={canvasDimensions.height}
        className="border-2 border-gray-400 rounded-lg max-w-full"
        style={{ display: "block", margin: "0 auto" }}
      />
    </div>
  );
};