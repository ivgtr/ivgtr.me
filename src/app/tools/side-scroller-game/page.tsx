import { Window } from "@/components/os/Window";
import { SideScrollerGame } from "./(components)/SideScrollerGame";

export default function SideScrollerGamePage() {
	return (
		<div className="os-subpage-workspace">
			<div className="os-subpage-window">
				<Window
					id="side-scroller-game"
					title="横スクロール2Dアクションゲーム"
					closable={false}
					minimizable={false}
				>
					<SideScrollerGame />
				</Window>
			</div>
		</div>
	);
}
