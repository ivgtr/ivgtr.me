import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	reactStrictMode: true,
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "pixel-image.vercel.app",
			},
			{
				protocol: "https",
				hostname: "crop-icon.vercel.app",
			},
		],
	},
};

export default nextConfig;
