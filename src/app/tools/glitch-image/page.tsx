import { Window } from "@/components/os/Window";
import { GlitchImage } from "./(components)/GlitchImage";

export default function GlitchImagePage() {
	return (
		<div className="os-subpage-workspace">
			<div className="os-subpage-window">
				<Window
					id="glitch-image"
					title="画像をマウスでグリッチする"
					closable={false}
					minimizable={false}
				>
					<GlitchImage />
				</Window>
			</div>
		</div>
	);
}
