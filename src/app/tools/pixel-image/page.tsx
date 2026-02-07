import { Window } from "@/components/os/Window";
import { PixelImage } from "./(components)/PixelImage";

export default function PixelImagePage() {
	return (
		<div className="os-subpage-workspace">
			<div className="os-subpage-window">
				<Window
					id="pixel-image"
					title="画像をドット風にする"
					closable={false}
					minimizable={false}
				>
					<PixelImage />
				</Window>
			</div>
		</div>
	);
}
