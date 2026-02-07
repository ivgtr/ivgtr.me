"use client";

import {
	faBlogger,
	faBluesky,
	faGithub,
	faSteam,
	faTwitter,
} from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { BlinkingText } from "@/components/retro/BlinkingText";

const accounts = [
	{
		title: "Twitter",
		alt: "ivgtr",
		url: "https://twitter.com/ivgtr",
		icon: faTwitter,
		color: "bg-blue-400",
		emoji: "🐦"
	},
	{
		title: "Bluesky",
		alt: "ivgtr",
		url: "https://bsky.app/profile/ivgtr.me",
		icon: faBluesky,
		color: "bg-sky-400",
		emoji: "🦋"
	},
	{
		title: "Github",
		alt: "ivgtr",
		url: "https://github.com/ivgtr",
		icon: faGithub,
		color: "bg-gray-700",
		emoji: "🐙"
	},
	{
		title: "Steam",
		alt: "Steam",
		url: "https://steamcommunity.com/id/oyanmi",
		icon: faSteam,
		color: "bg-blue-600",
		emoji: "🎮"
	},
	// NOTE: Scrapbox link hidden - content may not be available
	// {
	// 	title: "Scrapbox",
	// 	alt: "Scrapbox",
	// 	url: "https://scrapbox.io/ivgtr/",
	// 	icon: faBlogger,
	// 	color: "bg-green-600",
	// 	emoji: "📝"
	// },
];

export const Contact = () => {
	return (
		<div className="space-y-3">
			<div className="text-center mb-4">
				<BlinkingText className="text-purple-600 font-bold">
					🌐 各種アカウント 🌐
				</BlinkingText>
			</div>
			
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
				{accounts.map((account, i) => (
					<a
						key={i}
						href={account.url}
						target="_blank"
						rel="noopener noreferrer"
						className="block border-2 border-gray-400 bg-white hover:bg-gray-50 transition-colors duration-200 shadow-[inset_2px_2px_4px_rgba(255,255,255,0.8),inset_-2px_-2px_4px_rgba(0,0,0,0.3)] hover:shadow-[inset_-2px_-2px_4px_rgba(255,255,255,0.8),inset_2px_2px_4px_rgba(0,0,0,0.3)]"
					>
						<div className="p-3 flex items-center space-x-3">
							<div className={`w-10 h-10 ${account.color} border-2 border-gray-500 flex items-center justify-center text-white shadow-md`}>
								<FontAwesomeIcon icon={account.icon} size="lg" />
							</div>
							<div className="flex-1">
								<div className="font-bold text-gray-800 flex items-center gap-1">
									{account.emoji} {account.title}
								</div>
								<div className="text-sm text-gray-600 font-mono">
									{account.alt}
								</div>
							</div>
							<div className="text-lg">→</div>
						</div>
					</a>
				))}
			</div>
			
			<div className="text-center mt-4 text-sm text-gray-600">
				<div className="border border-gray-400 bg-yellow-50 p-2">
					💌 気軽にフォロー・連絡してください！
				</div>
			</div>
		</div>
	);
};
