"use client";

import { Button } from "@/components/Button";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { useCallback, useState } from "react";
import { useDrop } from "react-use";

export const ImageToBase64 = () => {
	const [, copy] = useCopyToClipboard();
	const [image, setImage] = useState<string | null>(null);
	const fileToBase64 = useCallback((file: File) => {
		const isImageFile = file.type.startsWith("image/");
		if (!isImageFile) return Promise.resolve(null);
		return new Promise<string>((resolve) => {
			const reader = new FileReader();
			reader.onload = () => {
				const result = reader.result;
				if (typeof result !== "string") return;
				resolve(result);
			};
			reader.readAsDataURL(file);
		});
	}, []);

	useDrop({
		onFiles: async (files) => {
			const file = files[0];
			const image = await fileToBase64(file);
			setImage(image);
		},
	});
	const handleImageSelectClick = useCallback(() => {
		const input = document.createElement("input");
		input.type = "file";
		input.accept = "image/*";
		input.onchange = async (e) => {
			const target = e.target as HTMLInputElement;
			if (!target.files) return;
			const file = target.files[0];
			const image = await fileToBase64(file);
			setImage(image);
		};
		input.click();
	}, [fileToBase64]);

	return (
		<div>
			<div className="relative w-full h-[300px] mt-12 bg-slate-200 dark:bg-slate-800">
				<div
					className="flex items-center justify-center w-full h-full"
					onClick={handleImageSelectClick}
				>
					<p>画像をD&Dするか、ここをクリックしてください</p>
				</div>
			</div>
			<div>
				{image && <img src={image} alt="preview" className="max-w-full h-auto mt-4" />}
				{image && (
					<div>
						<input
							type="text"
							defaultValue={image}
							className="w-full p-2 mt-4 dark:bg-slate-200 bg-slate-800"
						/>
						<Button
							onClick={() => {
								copy(image).then(() => {
									alert("コピーしました");
								});
							}}
							className="bg-blue-500 mt-4"
						>
							コピー
						</Button>
					</div>
				)}
			</div>
		</div>
	);
};
