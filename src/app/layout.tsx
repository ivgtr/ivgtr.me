import type { Metadata } from "next";
import { marumonica, aahub } from "../styles/fonts";
import { config } from "@fortawesome/fontawesome-svg-core";
config.autoAddCss = false;

import "@fortawesome/fontawesome-svg-core/styles.css";
import "@/styles/globals.css";
import { RetroBackground } from "@/components/retro/RetroBackground";
import { KonamiProvider } from "@/components/retro/KonamiProvider";

export const metadata: Metadata = {
	title: "tenori.me - 個人サイト",
	description: "卵の殻を破らねば、雛鳥は生まれずに死んでいく。",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="ja">
			<body className={`${marumonica.variable} ${aahub.variable} retro-site`}>
				<KonamiProvider>
					<RetroBackground />
					{children}
				</KonamiProvider>
			</body>
		</html>
	);
}
