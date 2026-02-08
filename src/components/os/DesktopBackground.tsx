"use client";

import { useBootSequence } from "@/components/os/BootSequenceContext";

export const DesktopBackground = () => {
	const { isPhaseReached, isComplete } = useBootSequence();

	const className = [
		"os-desktop-bg",
		!isComplete && !isPhaseReached("background") ? "os-boot-hidden" : "",
		!isComplete && isPhaseReached("background") ? "os-boot-fade-in" : "",
	]
		.filter(Boolean)
		.join(" ");

	return <div className={className} />;
};
