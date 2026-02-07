import { Window } from "@/components/os/Window";
import { ImageToBase64 } from "./(components)/ImageToBase64";

export default function ImageToBase64Page() {
	return (
		<div className="os-subpage-workspace">
			<div className="os-subpage-window">
				<Window
					id="image-to-base64"
					title="画像をbase64にする"
					closable={false}
					minimizable={false}
				>
					<ImageToBase64 />
				</Window>
			</div>
		</div>
	);
}
