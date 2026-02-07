import type { Metadata } from "next";
import { marumonica, aahub } from "../styles/fonts";
import { config } from "@fortawesome/fontawesome-svg-core";
config.autoAddCss = false;

import "@fortawesome/fontawesome-svg-core/styles.css";
import "@/styles/globals.css";
import { DesktopBackground } from "@/components/os/DesktopBackground";
import { KonamiProvider } from "@/components/retro/KonamiProvider";
import { MenuBarProvider } from "@/components/os/MenuBarContext";
import { MenuBar } from "@/components/os/MenuBar";

export const metadata: Metadata = {
	title: "ivgtr.me - 個人サイト",
	description: "卵の殻を破らねば、雛鳥は生まれずに死んでいく。",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="ja">
			<body className={`${marumonica.variable} ${aahub.variable} os-site`}>
				<KonamiProvider>
					<MenuBarProvider>
						<DesktopBackground />
						<MenuBar />
						<main className="os-workspace">{children}</main>
					</MenuBarProvider>
				</KonamiProvider>
			</body>
		</html>
	);
}
