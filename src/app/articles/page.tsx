import { Window } from "@/components/os/Window";
import { ArticlesContent } from "./(components)/ArticlesContent";

export default function Articles() {
	return (
		<div className="os-subpage-workspace">
			<div className="os-subpage-window">
				<Window
					id="articles"
					title="Articles - /home/ivgtr/articles/"
					closable={false}
					minimizable={false}
				>
					<ArticlesContent />
				</Window>
			</div>
		</div>
	);
}
