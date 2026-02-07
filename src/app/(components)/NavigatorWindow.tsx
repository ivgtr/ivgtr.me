"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { ToolsContent } from "@/app/tools/(components)/ToolsContent";
import { ArticlesContent } from "@/app/articles/(components)/ArticlesContent";

import { ClopIcon } from "@/app/tools/crop-icon/(components)/ClopIcon";
import { GlitchImage } from "@/app/tools/glitch-image/(components)/GlitchImage";
import { ImageToBase64 } from "@/app/tools/image-to-base64/(components)/ImageToBase64";
import { PixelImage } from "@/app/tools/pixel-image/(components)/PixelImage";
import { Tategaki } from "@/app/tools/tategaki/(components)/Tategaki";
import { XCharacterPromptGenerator } from "@/app/tools/x-character-prompt-generator/(components)/XCharacterPromptGenerator";
import { SideScrollerGame } from "@/app/tools/side-scroller-game/(components)/SideScrollerGame";

type Screen =
  | { type: "home" }
  | { type: "tools" }
  | { type: "articles" }
  | { type: "tool-detail"; tool: string };

const toolComponents: Record<string, { name: string; component: React.ReactNode }> = {
  "pixel-image": { name: "画像をドット風にする", component: <PixelImage /> },
  "crop-icon": { name: "画像を切り抜くやつ", component: <ClopIcon /> },
  "glitch-image": { name: "画像をマウスでグリッチする", component: <GlitchImage /> },
  "image-to-base64": { name: "画像をbase64にする", component: <ImageToBase64 /> },
  "tategaki": { name: "横書きの内容を縦書きするやつ", component: <Tategaki /> },
  "x-character-prompt-generator": { name: "Xキャラクタープロンプト生成", component: <XCharacterPromptGenerator /> },
  "side-scroller-game": { name: "横スクロール2Dアクションゲーム", component: <SideScrollerGame /> },
};

const toolList = [
  { slug: "pixel-image", name: "画像をドット風にする", category: "画像処理" },
  { slug: "crop-icon", name: "画像を切り抜くやつ", category: "画像処理" },
  { slug: "glitch-image", name: "画像をマウスでグリッチする", category: "画像処理" },
  { slug: "image-to-base64", name: "画像をbase64にする", category: "開発支援" },
  { slug: "tategaki", name: "横書きの内容を縦書きするやつ", category: "テキスト" },
  { slug: "x-character-prompt-generator", name: "Xキャラクタープロンプト生成", category: "AI支援" },
  { slug: "side-scroller-game", name: "横スクロール2Dアクションゲーム", category: "ゲーム" },
];

export const NavigatorWindow = () => {
  const [history, setHistory] = useState<Screen[]>([{ type: "home" }]);
  const screen = history[history.length - 1];

  const navigate = useCallback((next: Screen) => {
    setHistory((prev) => [...prev, next]);
  }, []);

  const goBack = useCallback(() => {
    setHistory((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));
  }, []);

  const getPath = () => {
    switch (screen.type) {
      case "home":
        return "/home/ivgtr/";
      case "tools":
        return "/home/ivgtr/tools/";
      case "articles":
        return "/home/ivgtr/articles/";
      case "tool-detail":
        return `/home/ivgtr/tools/${screen.tool}/`;
    }
  };

  return (
    <div className="os-navigator">
      <div className="os-navigator-toolbar">
        <button
          className="os-navigator-back"
          onClick={goBack}
          disabled={history.length <= 1}
        >
          &larr;
        </button>
        <div className="os-navigator-path">{getPath()}</div>
      </div>

      <div className="os-navigator-content">
        {screen.type === "home" && (
          <div className="os-navigator-tree">
            <button
              className="os-navigator-folder"
              onClick={() => navigate({ type: "tools" })}
            >
              <span className="os-folder-icon">&#128193;</span>
              <span>Tools</span>
            </button>
            <button
              className="os-navigator-folder"
              onClick={() => navigate({ type: "articles" })}
            >
              <span className="os-folder-icon">&#128193;</span>
              <span>Articles</span>
            </button>
          </div>
        )}

        {screen.type === "tools" && (
          <div className="os-navigator-tree">
            {toolList.map((tool) => (
              <button
                key={tool.slug}
                className="os-navigator-file"
                onClick={() => navigate({ type: "tool-detail", tool: tool.slug })}
              >
                <span className="os-file-icon">&#128196;</span>
                <span>{tool.name}</span>
                <span className="os-file-category">{tool.category}</span>
              </button>
            ))}
          </div>
        )}

        {screen.type === "articles" && (
          <div className="os-navigator-articles">
            <ArticlesContent />
          </div>
        )}

        {screen.type === "tool-detail" && toolComponents[screen.tool] && (
          <div className="os-navigator-tool-detail">
            <div className="os-navigator-tool-content">
              {toolComponents[screen.tool].component}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
