"use client";

import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface DesktopIcon {
	id: string;
	label: string;
	icon: IconDefinition;
	onDoubleClick: () => void;
}

interface DesktopIconsProps {
	icons: DesktopIcon[];
}

export const DesktopIcons = ({ icons }: DesktopIconsProps) => {
	return (
		<div className="os-desktop-icons">
			{icons.map((item) => (
				<button
					key={item.id}
					className="os-desktop-icon"
					onDoubleClick={item.onDoubleClick}
				>
					<FontAwesomeIcon icon={item.icon} className="os-desktop-icon-fa" />
					<span className="os-desktop-icon-label">{item.label}</span>
				</button>
			))}
		</div>
	);
};
