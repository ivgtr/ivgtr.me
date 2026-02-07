# interactive-test スキル

ツールページの動作テストを行うスキル。Playwright MCPツールで各ツールに実際の入力を行い、期待通りに機能するかを検証する。

## 引数

`$ARGUMENTS` でテスト対象のツールパスを指定可能（例: `/tools/tategaki`）。省略時は全ツールをテストする。

## 手順

### Step 1: 開発サーバー確認

`mcp__playwright__browser_navigate` で `http://localhost:3000` にアクセスし、開発サーバーが起動しているか確認する。

- **起動していない場合**: Bashツールで `npm run dev` をバックグラウンド実行（`run_in_background: true`）し、`mcp__playwright__browser_wait_for` で数秒待ってからリトライする。
- **起動している場合**: そのまま次のステップへ進む。

### Step 2: テスト用画像の準備

画像系ツールのテストに使用するダミー画像を生成する。`mcp__playwright__browser_evaluate` を使い、Canvasで100x100のカラフルなテスト画像を生成してダウンロードする。もしくはプロジェクト内の既存画像（`/public/icon.png`）を使用する。

### Step 3: SubAgentを使った並列テスト

Taskツール（`subagent_type: "general-purpose"`）を使ってSubAgentを並列起動する。

#### 引数なし（全ツールテスト）の場合

以下の3つのSubAgentを**1つのメッセージで同時に**起動する:

- **SubAgent 1**: テキスト系ツール (`/tools/tategaki`, `/tools/x-character-prompt-generator`)
- **SubAgent 2**: 画像系ツール前半 (`/tools/crop-icon`, `/tools/glitch-image`)
- **SubAgent 3**: 画像系ツール後半 (`/tools/pixel-image`, `/tools/image-to-base64`) + ゲーム (`/tools/side-scroller-game`)

#### 引数あり（特定ツール指定）の場合

指定されたツールのみをSubAgent 1つに委譲する。

#### 各ツールのテストシナリオ

**SubAgent 1 プロンプト:**

```
以下のツールページの動作テストを実施してください。

ベースURL: http://localhost:3000

## /tools/tategaki（縦書き変換）

1. `mcp__playwright__browser_navigate` で `/tools/tategaki` に遷移
2. `mcp__playwright__browser_snapshot` でページ構造を確認
3. テキスト入力欄を見つけ、`mcp__playwright__browser_type` で「テスト文章です。縦書きに変換されます。」と入力
4. 変換ボタンやプレビューが表示されるか確認
5. `mcp__playwright__browser_snapshot` で変換結果を確認
6. `mcp__playwright__browser_take_screenshot` でスクリーンショット撮影（filename: "test-tategaki.png"）
7. `mcp__playwright__browser_console_messages` で level: "error" のエラーがないか確認

**評価基準**:
- テキスト入力が受け付けられるか
- 縦書きプレビューが表示されるか
- コンソールエラーがないか

## /tools/x-character-prompt-generator（AIキャラプロンプト生成）

1. `mcp__playwright__browser_navigate` で `/tools/x-character-prompt-generator` に遷移
2. `mcp__playwright__browser_snapshot` でページ構造を確認
3. フォーム要素を探し、入力可能なフィールドに適切なテスト値を入力
4. 生成ボタンがあれば `mcp__playwright__browser_click` でクリック
5. 出力結果を確認
6. `mcp__playwright__browser_take_screenshot` でスクリーンショット撮影（filename: "test-x-character-prompt.png"）
7. `mcp__playwright__browser_console_messages` で level: "error" のエラーがないか確認

**評価基準**:
- フォーム入力が正常に動作するか
- プロンプトが生成されるか
- コピー機能があれば動作するか

各ツールの結果を以下の形式で返してください:

### {ツール名}
- **ステータス**: PASS / FAIL / PARTIAL
- **テスト内容**: 実施したテストの概要
- **結果詳細**: 各テストステップの結果
- **コンソールエラー**: 有無と内容
- **スクリーンショット**: ファイルパス
- **問題点**（該当時）: 具体的な問題と再現手順
```

**SubAgent 2 プロンプト:**

```
以下の画像ツールページの動作テストを実施してください。

ベースURL: http://localhost:3000
テスト画像パス: /Users/tenori/Data/pg/tenori.me/public/icon.png

## /tools/crop-icon（画像切り抜き）

1. `mcp__playwright__browser_navigate` で `/tools/crop-icon` に遷移
2. `mcp__playwright__browser_snapshot` でページ構造を確認
3. ファイルアップロード要素を探す
4. `mcp__playwright__browser_click` でファイル選択をトリガーし、`mcp__playwright__browser_file_upload` でテスト画像をアップロード
5. プレビュー・切り抜き設定UIが表示されるか確認
6. 設定を変更してみる（サイズ変更等）
7. `mcp__playwright__browser_take_screenshot` でスクリーンショット撮影（filename: "test-crop-icon.png"）
8. `mcp__playwright__browser_console_messages` で level: "error" のエラーがないか確認

**評価基準**:
- 画像アップロードが正常に動作するか
- プレビューが表示されるか
- 切り抜き操作が機能するか

## /tools/glitch-image（グリッチエフェクト）

1. `mcp__playwright__browser_navigate` で `/tools/glitch-image` に遷移
2. `mcp__playwright__browser_snapshot` でページ構造を確認
3. ファイルアップロード要素を探す
4. `mcp__playwright__browser_click` でファイル選択をトリガーし、`mcp__playwright__browser_file_upload` でテスト画像をアップロード
5. グリッチ設定UIが表示されるか確認
6. パラメータを変更してエフェクトが変わるか確認
7. `mcp__playwright__browser_take_screenshot` でスクリーンショット撮影（filename: "test-glitch-image.png"）
8. `mcp__playwright__browser_console_messages` で level: "error" のエラーがないか確認

**評価基準**:
- 画像アップロードが正常に動作するか
- グリッチエフェクトが適用されるか
- パラメータ変更が反映されるか

各ツールの結果を以下の形式で返してください:

### {ツール名}
- **ステータス**: PASS / FAIL / PARTIAL
- **テスト内容**: 実施したテストの概要
- **結果詳細**: 各テストステップの結果
- **コンソールエラー**: 有無と内容
- **スクリーンショット**: ファイルパス
- **問題点**（該当時）: 具体的な問題と再現手順
```

**SubAgent 3 プロンプト:**

```
以下のツールページの動作テストを実施してください。

ベースURL: http://localhost:3000
テスト画像パス: /Users/tenori/Data/pg/tenori.me/public/icon.png

## /tools/pixel-image（ドット絵変換）

1. `mcp__playwright__browser_navigate` で `/tools/pixel-image` に遷移
2. `mcp__playwright__browser_snapshot` でページ構造を確認
3. ファイルアップロード要素を探す
4. `mcp__playwright__browser_click` でファイル選択をトリガーし、`mcp__playwright__browser_file_upload` でテスト画像をアップロード
5. ドット絵変換の設定UIが表示されるか確認
6. ピクセルサイズ等のパラメータを変更してみる
7. `mcp__playwright__browser_take_screenshot` でスクリーンショット撮影（filename: "test-pixel-image.png"）
8. `mcp__playwright__browser_console_messages` で level: "error" のエラーがないか確認

**評価基準**:
- 画像アップロードが正常に動作するか
- ドット絵変換が適用されるか
- パラメータ変更が反映されるか

## /tools/image-to-base64（Base64変換）

1. `mcp__playwright__browser_navigate` で `/tools/image-to-base64` に遷移
2. `mcp__playwright__browser_snapshot` でページ構造を確認
3. ファイルアップロード要素を探す
4. `mcp__playwright__browser_click` でファイル選択をトリガーし、`mcp__playwright__browser_file_upload` でテスト画像をアップロード
5. Base64文字列が出力されるか確認
6. コピーボタンがあれば動作確認
7. `mcp__playwright__browser_take_screenshot` でスクリーンショット撮影（filename: "test-image-to-base64.png"）
8. `mcp__playwright__browser_console_messages` で level: "error" のエラーがないか確認

**評価基準**:
- 画像アップロードが正常に動作するか
- Base64文字列が正しく生成されるか
- コピー機能が動作するか

## /tools/side-scroller-game（横スクロールゲーム）

1. `mcp__playwright__browser_navigate` で `/tools/side-scroller-game` に遷移
2. `mcp__playwright__browser_snapshot` でページ構造を確認
3. ゲームのCanvas要素が存在するか確認
4. スタートボタンがあれば `mcp__playwright__browser_click` でクリック
5. `mcp__playwright__browser_press_key` で矢印キー・スペースキー等を操作
6. ゲームが反応するか（キャラクターが動く等）確認
7. `mcp__playwright__browser_take_screenshot` でスクリーンショット撮影（filename: "test-side-scroller.png"）
8. `mcp__playwright__browser_console_messages` で level: "error" のエラーがないか確認

**評価基準**:
- ゲームが正常に起動するか
- キー操作に反応するか
- コンソールエラーがないか

各ツールの結果を以下の形式で返してください:

### {ツール名}
- **ステータス**: PASS / FAIL / PARTIAL
- **テスト内容**: 実施したテストの概要
- **結果詳細**: 各テストステップの結果
- **コンソールエラー**: 有無と内容
- **スクリーンショット**: ファイルパス
- **問題点**（該当時）: 具体的な問題と再現手順
```

### Step 4: レポート統合

すべてのSubAgentの完了を待ち、結果を集約して以下の形式で出力する:

```markdown
# インタラクティブテストレポート

## サマリー
- テスト日時: {日時}
- テスト対象ツール数: {数}
- PASS: {数} / FAIL: {数} / PARTIAL: {数}

## ツール別テスト結果

### {ツール名} - {PASS/FAIL/PARTIAL}
- テスト内容と結果
- スクリーンショット
- 問題点と対応提案

（各ツール分繰り返す）

## 総合評価
全体的な品質評価と推奨対応
```
