"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

interface MenuBarContextValue {
	activeTitle: string;
	setActiveTitle: (title: string) => void;
}

const MenuBarContext = createContext<MenuBarContextValue>({
	activeTitle: "",
	setActiveTitle: () => {},
});

export function MenuBarProvider({ children }: { children: ReactNode }) {
	const [activeTitle, setActiveTitle] = useState("");

	return (
		<MenuBarContext value={{ activeTitle, setActiveTitle }}>
			{children}
		</MenuBarContext>
	);
}

export function useMenuBar() {
	return useContext(MenuBarContext);
}
