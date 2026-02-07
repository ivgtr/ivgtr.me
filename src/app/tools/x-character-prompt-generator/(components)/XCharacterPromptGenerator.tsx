"use client";

import React, { useState } from "react";
import {
	User,
	AlertCircle,
	FileText,
	Copy,
	Check,
	Upload,
	BarChart,
} from "lucide-react";
import { Button } from "@/components/Button";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import {
	TweetData,
	analyzeTweetsFromJSON,
	analyzeTweetsFromText,
} from "./tweetAnalyzer";
import { generateCharacterPrompt } from "./promptGenerator";

export const XCharacterPromptGenerator = () => {
	const [username, setUsername] = useState("");
	const [tweets, setTweets] = useState("");
	const [tweetsData, setTweetsData] = useState<TweetData[] | null>(null);
	const [generatedPrompt, setGeneratedPrompt] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [activeTab, setActiveTab] = useState("input");
	const [inputMode, setInputMode] = useState("text");
	const [copiedText, copy] = useCopyToClipboard();

	const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) {
			const reader = new FileReader();
			reader.onload = (e) => {
				try {
					const jsonData = JSON.parse(e.target?.result as string);
					setTweetsData(jsonData);
					if (jsonData.length > 0 && jsonData[0].username) {
						setUsername(jsonData[0].username);
					}
					setInputMode("json");
				} catch {
					alert(
						"JSONファイルの解析に失敗しました。正しい形式のファイルを選択してください。",
					);
				}
			};
			reader.readAsText(file);
		}
	};

	const generatePrompt = () => {
		if (!username || (!tweets && !tweetsData)) {
			alert("ユーザー名とツイート内容を入力してください");
			return;
		}

		setIsLoading(true);

		const analysis =
			inputMode === "json" && tweetsData
				? analyzeTweetsFromJSON(tweetsData)
				: analyzeTweetsFromText(tweets);

		const prompt = generateCharacterPrompt(username, analysis);

		setGeneratedPrompt(prompt);
		setActiveTab("output");
		setIsLoading(false);
	};

	const handleCopyToClipboard = async () => {
		await copy(generatedPrompt);
	};

	const resetInput = () => {
		setTweets("");
		setTweetsData(null);
		setInputMode("text");
	};

	return (
		<div className="space-y-6">
			<div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
				<div className="flex items-start">
					<AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
					<div className="text-sm text-yellow-800">
						<p className="font-semibold mb-1">使用上の注意</p>
						<ul className="list-disc list-inside space-y-1 text-xs">
							<li>Xの利用規約を遵守してください</li>
							<li>個人情報保護に配慮し、悪意のある使用は避けてください</li>
							<li>公開されているツイートのみを使用してください</li>
						</ul>
					</div>
				</div>
			</div>

			<div className="bg-white rounded-xl shadow-xl p-4">
				<div className="flex mb-6 border-b">
					<button
						onClick={() => setActiveTab("input")}
						className={`px-4 py-2 font-medium transition-colors ${
							activeTab === "input"
								? "text-blue-600 border-b-2 border-blue-600"
								: "text-gray-500 hover:text-gray-700"
						}`}
					>
						入力
					</button>
					<button
						onClick={() => setActiveTab("output")}
						className={`px-4 py-2 font-medium transition-colors ${
							activeTab === "output"
								? "text-blue-600 border-b-2 border-blue-600"
								: "text-gray-500 hover:text-gray-700"
						}`}
						disabled={!generatedPrompt}
					>
						生成されたプロンプト
					</button>
				</div>

				{activeTab === "input" && (
					<div className="space-y-6">
						<div className="flex gap-4 mb-4">
							<label className="flex items-center cursor-pointer">
								<input
									type="radio"
									name="inputMode"
									value="text"
									checked={inputMode === "text"}
									onChange={() => resetInput()}
									className="mr-2"
								/>
								<span className="text-sm font-medium text-gray-700">
									テキスト入力
								</span>
							</label>
							<label className="flex items-center cursor-pointer">
								<input
									type="radio"
									name="inputMode"
									value="json"
									checked={inputMode === "json"}
									onChange={() => setInputMode("json")}
									className="mr-2"
								/>
								<span className="text-sm font-medium text-gray-700">
									JSONファイル
								</span>
							</label>
						</div>

						<div>
							<label className="flex items-center text-sm font-medium text-gray-700 mb-2">
								<User className="w-4 h-4 mr-1" />
								Xユーザー名
							</label>
							<input
								type="text"
								value={username}
								onChange={(e) => setUsername(e.target.value)}
								placeholder="@username"
								className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							/>
						</div>

						{inputMode === "text" ? (
							<div>
								<label className="flex items-center text-sm font-medium text-gray-700 mb-2">
									<FileText className="w-4 h-4 mr-1" />
									ツイート内容（1行に1ツイート）
								</label>
								<textarea
									value={tweets}
									onChange={(e) => setTweets(e.target.value)}
									placeholder="ツイートをここに貼り付けてください..."
									className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-64 resize-none"
								/>
								<p className="text-xs text-gray-500 mt-1">
									最低50ツイート以上を推奨します
								</p>
							</div>
						) : (
							<div>
								<label className="flex items-center text-sm font-medium text-gray-700 mb-2">
									<Upload className="w-4 h-4 mr-1" />
									JSONファイルをアップロード
								</label>
								<div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
									<input
										type="file"
										accept=".json"
										onChange={handleFileUpload}
										className="hidden"
										id="file-upload"
									/>
									<label htmlFor="file-upload" className="cursor-pointer">
										<Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
										<p className="text-gray-700">クリックしてファイルを選択</p>
										<p className="text-xs text-gray-600 mt-1">
											JSONファイル（.json）のみ対応
										</p>
									</label>
								</div>
								{tweetsData && (
									<div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
										<div className="flex items-center text-green-700">
											<Check className="w-4 h-4 mr-2" />
											<span className="text-sm">
												{tweetsData.length}件のツイートを読み込みました
											</span>
										</div>
									</div>
								)}
							</div>
						)}

						<Button
							onClick={generatePrompt}
							disabled={isLoading || !username || (!tweets && !tweetsData)}
							className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 flex items-center justify-center"
						>
							{isLoading ? (
								"分析中..."
							) : (
								<>
									<BarChart className="w-5 h-5 mr-2 inline-block" />
									<span>プロンプトを生成</span>
								</>
							)}
						</Button>
					</div>
				)}

				{activeTab === "output" && generatedPrompt && (
					<div>
						<div className="bg-gray-50 p-4 rounded-lg mb-4">
							<pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono">
								{generatedPrompt}
							</pre>
						</div>
						<Button
							onClick={handleCopyToClipboard}
							className="w-full bg-gray-800 hover:bg-gray-900 flex items-center justify-center"
						>
							{copiedText ? (
								<>
									<Check className="w-5 h-5 mr-2 inline-block" />
									<span>コピーしました！</span>
								</>
							) : (
								<>
									<Copy className="w-5 h-5 mr-2 inline-block" />
									<span>プロンプトをコピー</span>
								</>
							)}
						</Button>
					</div>
				)}
			</div>

			<div className="bg-white rounded-xl shadow-md p-4">
				<h2 className="text-xl font-bold text-gray-800 mb-4">使用方法</h2>
				<div className="space-y-4">
					<div>
						<h3 className="font-semibold text-gray-700 mb-2">
							テキスト入力の場合
						</h3>
						<ol className="space-y-2 text-gray-600 text-sm ml-4">
							<li>1. ユーザー名を入力</li>
							<li>2. ツイート本文を1行に1つずつ貼り付け</li>
							<li>3. 「プロンプトを生成」をクリック</li>
						</ol>
					</div>
					<div>
						<h3 className="font-semibold text-gray-700 mb-2">
							JSONファイルの場合
						</h3>
						<ol className="space-y-2 text-gray-600 text-sm ml-4">
							<li>1. 「JSONファイル」を選択</li>
							<li>2. 指定形式のJSONファイルをアップロード</li>
							<li>3. 「プロンプトを生成」をクリック</li>
						</ol>
					</div>
				</div>
			</div>
		</div>
	);
};
