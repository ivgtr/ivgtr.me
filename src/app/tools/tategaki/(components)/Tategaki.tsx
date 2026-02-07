"use client";

import { Button } from "@/components/Button";
import { TextArea } from "@/components/TextArea";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { useMemo, useState } from "react";

export const Tategaki = () => {
	const [, copy] = useCopyToClipboard();
	const [rawText, setRawText] = useState(`丸亀製麺は

全ての店で

池の水から作る

そう

しなければ

こんなにも

すぐに

作れない

うどんで

あなたを

驚かせたい`);

	// テキストを2次元配列に変換
	const textArray = useMemo(() => {
		let maxLineLength = 0;
		const lines = rawText.split("\n");
		const textArray = lines.map((line) => {
			maxLineLength = Math.max(maxLineLength, line.length);
			return line.split("");
		});
		return textArray.map((line) => {
			const padding = maxLineLength - line.length;
			return [...line, ...Array(padding).fill("　")];
		});
	}, [rawText]);

	// 縦書きに回転
	const rotatedTextArray = useMemo(() => {
		const rotatedText = [];
		for (let i = 0; i < textArray[0].length; i++) {
			const line = [];
			for (let j = textArray.length - 1; j >= 0; j--) {
				line.push(textArray[j][i]);
			}
			rotatedText.push(line);
		}
		return rotatedText;
	}, [textArray]);

	// 2次元配列をテキストに変換
	const rotatedText = useMemo(() => {
		return rotatedTextArray.map((line) => line.join("")).join("\n");
	}, [rotatedTextArray]);

	return (
		<div>
			<div>
				<h2>入力</h2>
				<TextArea
					className=""
					defaultValue={rawText}
					rows={2}
					onChange={(e) => setRawText(e.target.value)}
				></TextArea>
			</div>

			<div className="mt-8">
				<h2>出力</h2>
				<pre className="overflow-x-auto">{rotatedText}</pre>
				<Button
					className="bg-blue-500 mt-4"
					onClick={() => {
						copy(rotatedText).then(() => {
							alert("コピーしました");
						});
					}}
				>
					コピー
				</Button>
			</div>
		</div>
	);
};
