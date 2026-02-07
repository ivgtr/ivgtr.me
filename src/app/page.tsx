"use client";

import { useEffect } from "react";
import { Window } from "@/components/os/Window";
import { StatusBar } from "@/components/os/StatusBar";
import { useWindowManager } from "@/hooks/useWindowManager";
import { useMenuBar } from "@/components/os/MenuBarContext";
import { ProfileWindow } from "./(components)/ProfileWindow";
import { NavigatorWindow } from "./(components)/NavigatorWindow";
import { AudioPlayerWindow } from "./(components)/AudioPlayerWindow";

const initialWindows = [
	{ id: "profile", isOpen: true, isMinimized: false, position: { x: 16, y: 16 } },
	{ id: "navigator", isOpen: true, isMinimized: false, position: { x: 380, y: 16 } },
	{ id: "audio", isOpen: true, isMinimized: false, position: { x: 16, y: 480 } },
];

const windowTitles: Record<string, string> = {
	profile: "Profile - ivgtr",
	navigator: "Navigator - /home/ivgtr/",
	audio: "Audio Player",
};

export default function Home() {
	const { windows, focus, close, minimize, restore, getWindow } =
		useWindowManager(initialWindows);
	const { setActiveTitle } = useMenuBar();

	const profileWin = getWindow("profile")!;
	const navigatorWin = getWindow("navigator")!;
	const audioWin = getWindow("audio")!;

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

	const minimizedWindows = windows
		.filter((w) => w.isOpen && w.isMinimized)
		.map((w) => ({
			id: w.id,
			title:
				w.id === "profile"
					? "Profile"
					: w.id === "navigator"
						? "Navigator"
						: "Audio Player",
			onRestore: () => restore(w.id),
		}));

	return (
		<>
			<div className="os-desktop-windows">
				<Window
					id="profile"
					title="Profile - ivgtr"
					defaultPosition={profileWin.position}
					defaultSize={{ width: 320 }}
					isOpen={profileWin.isOpen}
					isMinimized={profileWin.isMinimized}
					zIndex={profileWin.zIndex}
					closable={false}
					onMinimize={() => minimize("profile")}
					onFocus={() => focus("profile")}
				>
					<ProfileWindow />
				</Window>

				<Window
					id="navigator"
					title="Navigator - /home/ivgtr/"
					defaultPosition={navigatorWin.position}
					defaultSize={{ width: 520, height: 420 }}
					isOpen={navigatorWin.isOpen}
					isMinimized={navigatorWin.isMinimized}
					zIndex={navigatorWin.zIndex}
					closable={false}
					onMinimize={() => minimize("navigator")}
					onFocus={() => focus("navigator")}
				>
					<NavigatorWindow />
				</Window>

				<Window
					id="audio"
					title="Audio Player"
					defaultPosition={audioWin.position}
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

			<StatusBar minimizedWindows={minimizedWindows} />
		</>
	);
}
