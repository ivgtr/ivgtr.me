import { Button } from "@/components/Button";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDrop } from "react-use";

type Props = {
	mode: "r" | "g" | "b" | "rgb";
	splitHeight: number;
};

export const Stage = ({ mode, splitHeight = 40 }: Props) => {
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

	const canvasRef = useRef<HTMLCanvasElement>(null);
	// base64 image を格納する
	const [image, setImage] = useState<string | null>(null);
	const originImageDataRef = useRef<ImageData>(null);

	// canvas を取得するショートハンド
	const getCavas = useCallback(() => {
		const canvas = canvasRef.current;
		const ctx = canvas?.getContext("2d");
		if (!canvas || !ctx) {
			throw new Error("canvas is not found");
		}
		return { canvas, ctx };
	}, []);

	// canvas の初期化
	const initCanvas = useCallback(() => {
		if (!image) return;
		const { canvas, ctx } = getCavas();
		const img = new Image();
		img.src = image;
		img.onload = () => {
			const aspectRatio = img.width / img.height;
			const iw = 300 * aspectRatio;
			canvas.width = iw * 2;
			canvas.height = 300;
			const x = (canvas.width - iw) / 2;
			const y = (canvas.height - 300) / 2;
			ctx.drawImage(img, x, y, iw, 300);
			const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
			originImageDataRef.current = imageData;
		};
	}, [getCavas, image]);

	useEffect(() => {
		initCanvas();
	}, [initCanvas]);

	const [isMouseDown, setIsMouseDown] = useState(false);
	const [baseX, setBaseX] = useState(0);
	const [baseY, setBaseY] = useState(0);
	const prevImageDataRef = useRef<ImageData>(null);

	const resetImage = useCallback(() => {
		const { ctx } = getCavas();
		const imageData = originImageDataRef.current;
		if (!imageData) return;
		ctx.putImageData(imageData, 0, 0);
	}, [getCavas]);

	const downloadImage = useCallback(() => {
		const { canvas } = getCavas();
		const a = document.createElement("a");
		a.href = canvas.toDataURL();
		a.download = "glitch-image.png";
		a.click();
	}, [getCavas]);

	const deleteImage = useCallback(() => {
		const { canvas, ctx } = getCavas();
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		setImage(null);
	}, [getCavas]);

	const applyRandomGlitch = useCallback(() => {
		if (!originImageDataRef.current) return;
		
		const { canvas, ctx } = getCavas();
		const imageData = originImageDataRef.current;
		const width = canvas.width;
		const height = canvas.height;
		
		// 元画像をコピー
		const cloneImageData = ctx.createImageData(imageData);
		cloneImageData.data.set(imageData.data);
		
		// ランダムグリッチポイントを生成（3-7箇所）
		const numGlitches = Math.floor(Math.random() * 5) + 3;
		
		for (let g = 0; g < numGlitches; g++) {
			const y = Math.floor(Math.random() * (height - 50));
			const glitchHeight = Math.floor(Math.random() * 35) + 5; // 5-40px
			
			// R, G, Bチャンネルごとに異なるずらし量（画像幅の-15%〜+15%）
			const shiftR = Math.floor((Math.random() - 0.5) * width * 0.3);
			const shiftG = Math.floor((Math.random() - 0.5) * width * 0.3);
			const shiftB = Math.floor((Math.random() - 0.5) * width * 0.3);
			
			// グリッチエリアの元データを保存
			const originalData = new Uint8ClampedArray(cloneImageData.data);
			
			for (let row = y; row < Math.min(y + glitchHeight, height); row++) {
				for (let x = 0; x < width; x++) {
					const i = (row * width + x) * 4;
					
					// Rチャンネルをずらし
					const dstXR = x + shiftR;
					if (dstXR >= 0 && dstXR < width) {
						const dstIR = (row * width + dstXR) * 4;
						cloneImageData.data[dstIR + 0] = originalData[i + 0];
					}
					
					// Gチャンネルをずらし
					const dstXG = x + shiftG;
					if (dstXG >= 0 && dstXG < width) {
						const dstIG = (row * width + dstXG) * 4;
						cloneImageData.data[dstIG + 1] = originalData[i + 1];
					}
					
					// Bチャンネルをずらし
					const dstXB = x + shiftB;
					if (dstXB >= 0 && dstXB < width) {
						const dstIB = (row * width + dstXB) * 4;
						cloneImageData.data[dstIB + 2] = originalData[i + 2];
					}
				}
			}
		}
		
		// アルファチャンネルを修正
		for (let i = 0; i < cloneImageData.data.length; i += 4) {
			if (
				cloneImageData.data[i + 0] ||
				cloneImageData.data[i + 1] ||
				cloneImageData.data[i + 2]
			) {
				cloneImageData.data[i + 3] = 255;
			} else {
				cloneImageData.data[i + 3] = 0;
			}
		}
		
		ctx.putImageData(cloneImageData, 0, 0);
		
		// 現在の状態を保存
		const currentImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
		prevImageDataRef.current = currentImageData;
	}, [getCavas]);

	const glitchImage = useCallback(
		(shiftX: number) => {
			if (!prevImageDataRef.current) return;
			const { canvas, ctx } = getCavas();
			const prevImageData = prevImageDataRef.current;
			const cloneImageData = ctx.createImageData(prevImageData);
			// imageData をコピーする
			const imageData = new Uint8ClampedArray(cloneImageData.data);
			const tmp = new Uint8ClampedArray(prevImageData.data);
			const width = canvas.width;

			for (let y = 0; y < splitHeight; y++) {
				for (let x = 0; x < width; x++) {
					const i = (y * width + x) * 4;
					const dstX = x + shiftX;

					if (dstX >= 0 && dstX < width) {
						const dstI = (y * width + dstX) * 4;
						// mode === "rgb" の場合、全ての色を移動する
						// mode === "r" の場合、赤のみを移動する（緑と青はコピーする）
						// mode === "g" の場合、緑のみを移動する（赤と青はコピーする）
						// mode === "b" の場合、青のみを移動する（赤と緑はコピーする）
						if (mode === "rgb") {
							imageData[dstI + 0] = tmp[i + 0];
							imageData[dstI + 1] = tmp[i + 1];
							imageData[dstI + 2] = tmp[i + 2];
						} else if (mode === "r") {
							imageData[dstI + 0] = tmp[i + 0];
							imageData[i + 1] = tmp[i + 1];
							imageData[i + 2] = tmp[i + 2];
						} else if (mode === "g") {
							imageData[i + 0] = tmp[i + 0];
							imageData[dstI + 1] = tmp[i + 1];
							imageData[i + 2] = tmp[i + 2];
						} else if (mode === "b") {
							imageData[i + 0] = tmp[i + 0];
							imageData[i + 1] = tmp[i + 1];
							imageData[dstI + 2] = tmp[i + 2];
						}
						// alpha はrgb の何れかが存在する場合255, それ以外は0
						if (
							imageData[dstI + 0] ||
							imageData[dstI + 1] ||
							imageData[dstI + 2]
						) {
							imageData[dstI + 3] = 255;
						} else {
							imageData[dstI + 3] = 0;
						}

						if (imageData[i + 0] || imageData[i + 1] || imageData[i + 2]) {
							imageData[i + 3] = 255;
						} else {
							imageData[i + 3] = 0;
						}
					}
				}
			}
			cloneImageData.data.set(imageData);

			const y = baseY - splitHeight / 2;
			ctx.putImageData(cloneImageData, 0, y);
		},
		[getCavas, baseY, mode, splitHeight],
	);

	const handleMouseMove = useCallback(
		(e: MouseEvent) => {
			if (!isMouseDown) return;
			const distanceX = e.clientX - baseX;
			glitchImage(distanceX);
		},
		[isMouseDown, baseX, glitchImage],
	);

	const handleMouseUp = useCallback(() => {
		const { canvas, ctx } = getCavas();
		setIsMouseDown(false);
		setBaseX(0);
		setBaseY(0);
		const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
		prevImageDataRef.current = imageData;

		window.removeEventListener("mousemove", handleMouseMove);
		window.removeEventListener("mouseup", handleMouseUp);
	}, [handleMouseMove, getCavas]);

	const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
		const { canvas, ctx } = getCavas();
		const y = e.clientY - canvas.getBoundingClientRect().top;
		const startY = y - splitHeight / 2;
		const imageData = ctx.getImageData(0, startY, canvas.width, splitHeight);
		prevImageDataRef.current = imageData;
		setIsMouseDown(true);
		setBaseX(e.clientX);
		setBaseY(y);
	};

	useEffect(() => {
		if (isMouseDown) {
			window.addEventListener("mousemove", handleMouseMove);
			window.addEventListener("mouseup", handleMouseUp);
		}

		return () => {
			window.removeEventListener("mousemove", handleMouseMove);
			window.removeEventListener("mouseup", handleMouseUp);
		};
	}, [isMouseDown, handleMouseMove, handleMouseUp]);

	return (
		<div>
			<div className="relative w-full h-[300px] mt-12 bg-slate-200 dark:bg-slate-800">
				<div className="flex items-center justify-center w-full h-full">
					{!image ? (
						<div
							className="w-full h-full flex items-center justify-center"
							onClick={handleImageSelectClick}
						>
							<p>画像をD&Dするか、ここをクリックしてください</p>
						</div>
					) : (
						<div onMouseDown={handleMouseDown}>
							<canvas ref={canvasRef} />
						</div>
					)}
				</div>
			</div>
			<div className="flex flex-wrap gap-2 mt-4">
				<Button onClick={resetImage} className="bg-gray-500" disabled={!image}>
					リセット
				</Button>
				<Button
					onClick={applyRandomGlitch}
					className="bg-purple-500"
					disabled={!image}
				>
					ランダムグリッチ
				</Button>
				<Button
					onClick={downloadImage}
					className="bg-blue-500"
					disabled={!image}
				>
					ダウンロード
				</Button>
				<Button onClick={deleteImage} className="bg-red-500">
					消去
				</Button>
			</div>
		</div>
	);
};
