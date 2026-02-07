import { Window } from "@/components/os/Window";
import { ToolsContent } from "./(components)/ToolsContent";

export default function Tools() {
	return (
		<div className="os-subpage-workspace">
			<div className="os-subpage-window">
				<Window
					id="tools-list"
					title="Tools - /home/ivgtr/tools/"
					closable={false}
					minimizable={false}
				>
					<ToolsContent />
				</Window>
			</div>
		</div>
	);
}
