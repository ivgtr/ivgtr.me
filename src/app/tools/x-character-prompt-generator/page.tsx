import { Window } from "@/components/os/Window";
import { XCharacterPromptGenerator } from "./(components)/XCharacterPromptGenerator";

export default function XCharacterPromptGeneratorPage() {
	return (
		<div className="os-subpage-workspace">
			<div className="os-subpage-window">
				<Window
					id="x-character-prompt-generator"
					title="Xキャラクタープロンプト生成"
					closable={false}
					minimizable={false}
				>
					<XCharacterPromptGenerator />
				</Window>
			</div>
		</div>
	);
}
