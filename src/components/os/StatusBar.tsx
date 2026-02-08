"use client";

import { RetroVisitorCounter } from "@/components/retro/RetroVisitorCounter";
import { useBootSequence } from "@/components/os/BootSequenceContext";

interface TaskbarWindow {
	id: string;
	title: string;
	isOpen: boolean;
	isMinimized: boolean;
	isActive: boolean;
	closable: boolean;
	onFocus: () => void;
	onMinimize: () => void;
	onRestore: () => void;
	onClose: () => void;
}

interface StatusBarProps {
	taskbarWindows?: TaskbarWindow[];
}

export const StatusBar = ({ taskbarWindows = [] }: StatusBarProps) => {
	const { isPhaseReached, isComplete } = useBootSequence();
	const visibleWindows = taskbarWindows.filter((w) => w.isOpen);

	const barClassName = [
		"os-statusbar",
		!isComplete && !isPhaseReached("statusbar") ? "os-boot-hidden" : "",
		!isComplete && isPhaseReached("statusbar") ? "os-boot-slide-up" : "",
	]
		.filter(Boolean)
		.join(" ");

	return (
		<div className={barClassName}>
			<div className="os-statusbar-left">
				<span className="os-statusbar-indicator" />
				<span>Connection: OK</span>
			</div>
			<div className="os-statusbar-center">
				{visibleWindows.map((w) => {
					const className = [
						"os-taskbar-btn",
						w.isActive && !w.isMinimized ? "os-taskbar-btn--active" : "",
						w.isMinimized ? "os-taskbar-btn--minimized" : "",
					]
						.filter(Boolean)
						.join(" ");

					const handleClick = () => {
						if (w.isMinimized) {
							w.onRestore();
						} else if (w.isActive) {
							w.onMinimize();
						} else {
							w.onFocus();
						}
					};

					const handleContextMenu = (e: React.MouseEvent) => {
						e.preventDefault();
						if (w.closable) {
							w.onClose();
						}
					};

					return (
						<button
							key={w.id}
							className={className}
							onClick={handleClick}
							onContextMenu={handleContextMenu}
						>
							{w.title}
						</button>
					);
				})}
			</div>
			<div className="os-statusbar-right">
				<RetroVisitorCounter />
			</div>
		</div>
	);
};
