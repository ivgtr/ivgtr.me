"use client";

import useSWR from "swr/immutable";
import Link from "next/link";
import clsx from "clsx";
import { FormattedDate } from "@/components/FormattedDate";
import type { Project } from "@/types/projects";

const fetcher = async (url: string) => {
	const response = await fetch(url);
	if (!response.ok) {
		throw new Error(`Failed to fetch: ${response.status}`);
	}
	return (await response.json()) as Project[];
};

export const ProjectsContent = () => {
	const { data, error } = useSWR<Project[]>("/api/projects", fetcher);

	if (error) {
		return <p>GitHubリポジトリの取得に失敗しました</p>;
	}
	if (!data) {
		return <p>GitHubリポジトリを取得中...</p>;
	}
	if (data.length === 0) {
		return <p>表示できるリポジトリがありません</p>;
	}

	return (
		<ul className="os-navigator-projects-list">
			{data.map((project) => (
				<li key={project.url} className="os-navigator-project-item">
					<p className="os-navigator-project-title">
						<Link
							href={project.url}
							target="_blank"
							rel="noreferrer"
							className={clsx("hover:underline", "text-blue-500")}
						>
							{project.name}
						</Link>
					</p>
					<p className="os-navigator-project-description">{project.description}</p>
					<p className="os-navigator-project-meta">
						{project.language} / ★{project.stars} / Fork {project.forks} / Updated{" "}
						<FormattedDate date={project.updatedAt} />
					</p>
				</li>
			))}
		</ul>
	);
};
