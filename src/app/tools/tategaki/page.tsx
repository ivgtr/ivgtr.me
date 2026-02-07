import { Window } from "@/components/os/Window";
import { Tategaki } from "./(components)/Tategaki";

export default function TategakiPage() {
	return (
		<div className="os-subpage-workspace">
			<div className="os-subpage-window">
				<Window
					id="tategaki"
					title="横書きの内容を縦書きするやつ"
					closable={false}
					minimizable={false}
				>
					<Tategaki />
				</Window>
			</div>
		</div>
	);
}
