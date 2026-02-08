"use client";

import { useCallback, useEffect, useState } from "react";
import { faUser, faCompass, faMusic } from "@fortawesome/free-solid-svg-icons";
import { Window } from "@/components/os/Window";
import { StatusBar } from "@/components/os/StatusBar";
import { DesktopIcons } from "@/components/os/DesktopIcons";
import { useWindowManager } from "@/hooks/useWindowManager";
import { useMenuBar } from "@/components/os/MenuBarContext";
import { ProfileWindow } from "./(components)/ProfileWindow";
import { NavigatorWindow } from "./(components)/NavigatorWindow";
import { AudioPlayerWindow } from "./(components)/AudioPlayerWindow";

const basePositions = {
	profile: { x: 16, y: 16 },
	navigator: { x: 380, y: 16 },
	audio: { x: 16, y: 480 },
};

const RANDOM_OFFSET_RANGE = 30;

function randomOffset(range: number) {
	return Math.round(Math.random() * range * 2 - range);
}

const initialWindows = [
	{ id: "profile", isOpen: true, isMinimized: false, position: basePositions.profile },
	{ id: "navigator", isOpen: true, isMinimized: false, position: basePositions.navigator },
	{ id: "audio", isOpen: true, isMinimized: false, position: basePositions.audio },
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

	const { windows, focus, close, minimize, restore, open, getWindow, updatePosition } =
		useWindowManager(initialWindows);
	const { setActiveTitle } = useMenuBar();

	useEffect(() => {
		const newPositions: Record<string, { x: number; y: number }> = {};
		for (const [id, base] of Object.entries(basePositions)) {
			const pos = {
				x: base.x + randomOffset(RANDOM_OFFSET_RANGE),
				y: Math.max(0, base.y + randomOffset(RANDOM_OFFSET_RANGE)),
			};
			newPositions[id] = pos;
			updatePosition(id, pos);
		}
		setRandomPositions(newPositions);
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
				const base = basePositions[id as keyof typeof basePositions];
				if (base) {
					const pos = {
						x: base.x + randomOffset(RANDOM_OFFSET_RANGE),
						y: Math.max(0, base.y + randomOffset(RANDOM_OFFSET_RANGE)),
					};
					updatePosition(id, pos);
					setRandomPositions((prev) => (prev ? { ...prev, [id]: pos } : { [id]: pos }));
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

	return (
		<>
			<div className="os-desktop-windows">
				<DesktopIcons icons={desktopIconData} />

				<Window
					id="profile"
					title="Profile - ivgtr"
					defaultPosition={profileWin.position}
					position={randomPositions?.profile}
					defaultSize={{ width: 320 }}
					isOpen={profileWin.isOpen}
					isMinimized={profileWin.isMinimized}
					zIndex={profileWin.zIndex}
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
					onClose={() => close("audio")}
					onMinimize={() => minimize("audio")}
					onFocus={() => focus("audio")}
				>
					<AudioPlayerWindow />
				</Window>
			</div>

			<StatusBar taskbarWindows={taskbarWindows} />
		</>
	);
}
