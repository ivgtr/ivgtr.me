import { Window } from "@/components/os/Window";
import { ClopIcon } from "./(components)/ClopIcon";

export default function ClopIconPage() {
	return (
		<div className="os-subpage-workspace">
			<div className="os-subpage-window">
				<Window
					id="crop-icon"
					title="画像を切り抜くやつ"
					closable={false}
					minimizable={false}
				>
					<ClopIcon />
				</Window>
			</div>
		</div>
	);
}
