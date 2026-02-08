"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type BootPhase = "idle" | "background" | "menubar" | "statusbar" | "windows" | "icons" | "complete";

const PHASE_ORDER: BootPhase[] = ["idle", "background", "menubar", "statusbar", "windows", "icons", "complete"];

interface BootSequenceContextValue {
	phase: BootPhase;
	isComplete: boolean;
	isPhaseReached: (target: BootPhase) => boolean;
}

const BootSequenceContext = createContext<BootSequenceContextValue>({
	phase: "complete",
	isComplete: true,
	isPhaseReached: () => true,
});

export function useBootSequence() {
	return useContext(BootSequenceContext);
}

const PHASE_TIMINGS: { phase: BootPhase; delay: number }[] = [
	{ phase: "background", delay: 100 },
	{ phase: "menubar", delay: 300 },
	{ phase: "statusbar", delay: 600 },
	{ phase: "windows", delay: 800 },
	{ phase: "icons", delay: 1200 },
	{ phase: "complete", delay: 1400 },
];

export function BootSequenceProvider({ children }: { children: ReactNode }) {
	const [phase, setPhase] = useState<BootPhase>("idle");

	useEffect(() => {
		const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
		if (prefersReducedMotion) {
			setPhase("complete");
			return;
		}

		const timers: ReturnType<typeof setTimeout>[] = [];
		for (const { phase: p, delay } of PHASE_TIMINGS) {
			timers.push(setTimeout(() => setPhase(p), delay));
		}

		return () => {
			for (const t of timers) clearTimeout(t);
		};
	}, []);

	const isComplete = phase === "complete";

	const isPhaseReached = (target: BootPhase): boolean => {
		return PHASE_ORDER.indexOf(phase) >= PHASE_ORDER.indexOf(target);
	};

	return (
		<BootSequenceContext.Provider value={{ phase, isComplete, isPhaseReached }}>
			{children}
		</BootSequenceContext.Provider>
	);
}
