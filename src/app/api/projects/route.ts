import { NextResponse } from "next/server";
import { Project } from "@/types/projects";

const GITHUB_REPOS_API =
	"https://api.github.com/users/ivgtr/repos?sort=updated&direction=desc&per_page=24&type=owner";

type GitHubRepo = {
	name: string;
	html_url: string;
	description: string | null;
	language: string | null;
	stargazers_count: number;
	forks_count: number;
	fork: boolean;
	archived: boolean;
	updated_at: string;
};

export async function GET() {
	try {
		const response = await fetch(GITHUB_REPOS_API, {
			headers: {
				Accept: "application/vnd.github+json",
				"X-GitHub-Api-Version": "2022-11-28",
				"User-Agent": "ivgtr.me-navigator",
			},
			next: {
				revalidate: 60 * 60,
			},
		});

		if (!response.ok) {
			throw new Error(`GitHub API error: ${response.status}`);
		}

		const repos = (await response.json()) as GitHubRepo[];

		const projects: Project[] = repos
			.filter((repo) => !repo.fork && !repo.archived)
			.map((repo) => ({
				name: repo.name,
				url: repo.html_url,
				description: repo.description ?? "説明はありません",
				language: repo.language ?? "Unknown",
				stars: repo.stargazers_count,
				forks: repo.forks_count,
				updatedAt: repo.updated_at,
			}));

		return NextResponse.json(projects);
	} catch (error) {
		console.error(error);
		return NextResponse.json(
			{ message: "Failed to fetch repositories from GitHub" },
			{ status: 502 },
		);
	}
}
