"use client";

import { useCallback, useEffect, useState } from "react";
import { faUser, faCompass, faMusic } from "@fortawesome/free-solid-svg-icons";
import { Window } from "@/components/os/Window";
import { StatusBar } from "@/components/os/StatusBar";
import { DesktopIcons } from "@/components/os/DesktopIcons";
import { useWindowManager } from "@/hooks/useWindowManager";
import { useMenuBar } from "@/components/os/MenuBarContext";
import { useBootSequence } from "@/components/os/BootSequenceContext";
import { ProfileWindow } from "./(components)/ProfileWindow";
import { NavigatorWindow } from "./(components)/NavigatorWindow";
import { AudioPlayerWindow } from "./(components)/AudioPlayerWindow";

const windowSizes: Record<string, { width: number; height: number }> = {
	profile: { width: 320, height: 400 },
	navigator: { width: 520, height: 420 },
	audio: { width: 340, height: 200 },
};

const windowZones: { id: string; col: number; row: number }[] = [
	{ id: "profile", col: 0, row: 0 },
	{ id: "navigator", col: 1, row: 0 },
	{ id: "audio", col: 0, row: 1 },
];

const fallbackPositions: Record<string, { x: number; y: number }> = {
	profile: { x: 16, y: 16 },
	navigator: { x: 380, y: 16 },
	audio: { x: 16, y: 480 },
};

function calculateRandomPositions(): Record<string, { x: number; y: number }> {
	const screenW = window.innerWidth;
	const screenH = window.innerHeight;

	const DESKTOP_ICONS_WIDTH = 96;
	const MENU_BAR_HEIGHT = 32;
	const STATUS_BAR_HEIGHT = 28;
	const PADDING = 8;

	const availableX = DESKTOP_ICONS_WIDTH;
	const availableY = MENU_BAR_HEIGHT;
	const availableW = screenW - DESKTOP_ICONS_WIDTH - PADDING;
	const availableH = screenH - MENU_BAR_HEIGHT - STATUS_BAR_HEIGHT - PADDING;

	const cols = 2;
	const rows = 2;
	const zoneW = availableW / cols;
	const zoneH = availableH / rows;

	const positions: Record<string, { x: number; y: number }> = {};

	for (const zone of windowZones) {
		const winSize = windowSizes[zone.id];
		if (!winSize) continue;

		const zoneLeft = availableX + zone.col * zoneW;
		const zoneTop = availableY + zone.row * zoneH;

		const maxOffsetX = zoneW - winSize.width - PADDING;
		const maxOffsetY = zoneH - winSize.height - PADDING;

		let x: number;
		let y: number;

		if (maxOffsetX > 0 && maxOffsetY > 0) {
			x = zoneLeft + Math.round(Math.random() * maxOffsetX);
			y = zoneTop + Math.round(Math.random() * maxOffsetY);
		} else {
			x = zoneLeft + PADDING;
			y = zoneTop + PADDING;
		}

		x = Math.max(0, Math.min(x, screenW - winSize.width));
		y = Math.max(0, Math.min(y, screenH - winSize.height - STATUS_BAR_HEIGHT));

		positions[zone.id] = { x, y };
	}

	return positions;
}

const initialWindows = [
	{ id: "profile", isOpen: true, isMinimized: false, position: fallbackPositions.profile },
	{ id: "navigator", isOpen: true, isMinimized: false, position: fallbackPositions.navigator },
	{ id: "audio", isOpen: true, isMinimized: false, position: fallbackPositions.audio },
];

const windowTitles: Record<string, string> = {
	profile: "Profile - ivgtr",
	navigator: "Navigator - /home/ivgtr/",
	audio: "Audio Player",
};

const shortTitles: Record<string, string> = {
	profile: "Profile",
	navigator: "Navigator",
	audio: "Audio Player",
};

export default function Home() {
	const [randomPositions, setRandomPositions] = useState<Record<string, { x: number; y: number }> | null>(null);
	const [isReady, setIsReady] = useState(false);

	const { windows, focus, close, minimize, restore, open, getWindow, updatePosition } =
		useWindowManager(initialWindows);
	const { setActiveTitle } = useMenuBar();
	const { isPhaseReached, isComplete } = useBootSequence();

	useEffect(() => {
		if (window.innerWidth < 768) {
			setIsReady(true);
			return;
		}
		const newPositions = calculateRandomPositions();
		for (const [id, pos] of Object.entries(newPositions)) {
			updatePosition(id, pos);
		}
		setRandomPositions(newPositions);
		setIsReady(true);
	}, [updatePosition]);

	const profileWin = getWindow("profile")!;
	const navigatorWin = getWindow("navigator")!;
	const audioWin = getWindow("audio")!;

	const topZIndex = windows
		.filter((w) => w.isOpen && !w.isMinimized)
		.reduce((max, w) => Math.max(max, w.zIndex), -1);

	useEffect(() => {
		const activeWindows = windows.filter((w) => w.isOpen && !w.isMinimized);
		if (activeWindows.length === 0) {
			setActiveTitle("");
			return;
		}
		const topWindow = activeWindows.reduce((a, b) =>
			a.zIndex > b.zIndex ? a : b,
		);
		setActiveTitle(windowTitles[topWindow.id] ?? "");
	}, [windows, setActiveTitle]);

	const handleOpenFromIcon = useCallback(
		(id: string) => {
			const w = getWindow(id);
			if (!w) return;
			if (w.isOpen && !w.isMinimized) {
				focus(id);
			} else if (w.isOpen && w.isMinimized) {
				restore(id);
			} else {
				if (window.innerWidth >= 768) {
					const newPositions = calculateRandomPositions();
					const pos = newPositions[id];
					if (pos) {
						updatePosition(id, pos);
						setRandomPositions((prev) => (prev ? { ...prev, [id]: pos } : { [id]: pos }));
					}
				}
				open(id);
			}
		},
		[getWindow, focus, restore, open, updatePosition],
	);

	const desktopIconData = [
		{ id: "profile", label: "Profile", icon: faUser },
		{ id: "navigator", label: "Navigator", icon: faCompass },
		{ id: "audio", label: "Audio", icon: faMusic },
	].map((item) => ({
		...item,
		onDoubleClick: () => handleOpenFromIcon(item.id),
	}));

	const taskbarWindows = windows.map((w) => ({
		id: w.id,
		title: shortTitles[w.id] ?? w.id,
		isOpen: w.isOpen,
		isMinimized: w.isMinimized,
		isActive: w.isOpen && !w.isMinimized && w.zIndex === topZIndex,
		closable: true,
		onFocus: () => focus(w.id),
		onMinimize: () => minimize(w.id),
		onRestore: () => restore(w.id),
		onClose: () => close(w.id),
	}));

	const showWindows = isReady && isPhaseReached("windows");
	const staggerBase = isComplete ? 0 : 200;

	return (
		<>
			<div className="os-desktop-windows">
				<DesktopIcons icons={desktopIconData} visible={isPhaseReached("icons")} />

				{showWindows && (
					<>
						<Window
							id="profile"
							title="Profile - ivgtr"
							defaultPosition={profileWin.position}
							position={randomPositions?.profile}
							defaultSize={{ width: 320 }}
							isOpen={profileWin.isOpen}
							isMinimized={profileWin.isMinimized}
							zIndex={profileWin.zIndex}
							staggerDelay={staggerBase * 0}
							onClose={() => close("profile")}
							onMinimize={() => minimize("profile")}
							onFocus={() => focus("profile")}
						>
							<ProfileWindow />
						</Window>

						<Window
							id="navigator"
							title="Navigator - /home/ivgtr/"
							defaultPosition={navigatorWin.position}
							position={randomPositions?.navigator}
							defaultSize={{ width: 520, height: 420 }}
							isOpen={navigatorWin.isOpen}
							isMinimized={navigatorWin.isMinimized}
							zIndex={navigatorWin.zIndex}
							staggerDelay={staggerBase * 1}
							onClose={() => close("navigator")}
							onMinimize={() => minimize("navigator")}
							onFocus={() => focus("navigator")}
						>
							<NavigatorWindow />
						</Window>

						<Window
							id="audio"
							title="Audio Player"
							defaultPosition={audioWin.position}
							position={randomPositions?.audio}
							defaultSize={{ width: 340 }}
							isOpen={audioWin.isOpen}
							isMinimized={audioWin.isMinimized}
							zIndex={audioWin.zIndex}
							staggerDelay={staggerBase * 2}
							onClose={() => close("audio")}
							onMinimize={() => minimize("audio")}
							onFocus={() => focus("audio")}
						>
							<AudioPlayerWindow />
						</Window>
					</>
				)}
			</div>

			<StatusBar taskbarWindows={taskbarWindows} />
		</>
	);
}
