# check-design スキル

デザインの表示崩れをチェックするスキル。Playwright MCPツールを使ってページを巡回し、スクリーンショットとアクセシビリティスナップショットで表示崩れを評価する。

## 引数

`$ARGUMENTS` でチェック対象のパスを指定可能（例: `/tools/crop-icon`）。省略時は全ページを巡回する。

## 手順

### Step 1: 開発サーバー確認

`mcp__playwright__browser_navigate` で `http://localhost:3000` にアクセスし、開発サーバーが起動しているか確認する。

- **起動していない場合**: Bashツールで `npm run dev` をバックグラウンド実行（`run_in_background: true`）し、`mcp__playwright__browser_wait_for` で数秒待ってからリトライする。
- **起動している場合**: そのまま次のステップへ進む。

### Step 2: SubAgentを使った並列チェック

Taskツール（`subagent_type: "general-purpose"`）を使ってSubAgentを並列起動する。

#### 引数なし（全ページ巡回）の場合

以下の3つのSubAgentを**1つのメッセージで同時に**起動する:

- **SubAgent 1**: `/`, `/articles`, `/tools`
- **SubAgent 2**: `/tools/crop-icon`, `/tools/glitch-image`, `/tools/image-to-base64`, `/tools/pixel-image`
- **SubAgent 3**: `/tools/side-scroller-game`, `/tools/tategaki`, `/tools/x-character-prompt-generator`

#### 引数あり（特定ページ指定）の場合

指定されたパスのみをSubAgent 1つに委譲する。

#### 各SubAgentへのプロンプトテンプレート

各SubAgentには以下のプロンプトを渡す（`{PAGES}` を担当ページリストに置換）:

```
以下のページのデザインチェックを実施してください。

対象ページ: {PAGES}
ベースURL: http://localhost:3000

各ページについて以下の手順を実行してください:

1. **デスクトップ確認 (1280x800)**
   - `mcp__playwright__browser_resize` で width: 1280, height: 800 に設定
   - `mcp__playwright__browser_navigate` で対象ページに遷移
   - `mcp__playwright__browser_take_screenshot` で fullPage: true のスクリーンショットを撮影（filename: ".playwright-mcp/desktop-{パス名}.png"）
   - `mcp__playwright__browser_snapshot` でアクセシビリティスナップショットを取得
   - `mcp__playwright__browser_console_messages` で level: "warning" のコンソールメッセージを確認

2. **モバイル確認 (375x667)**
   - `mcp__playwright__browser_resize` で width: 375, height: 667 に設定
   - `mcp__playwright__browser_take_screenshot` で fullPage: true のスクリーンショットを撮影（filename: ".playwright-mcp/mobile-{パス名}.png"）
   - `mcp__playwright__browser_snapshot` でアクセシビリティスナップショットを取得

3. **ページごとの評価**を以下の観点で実施:
   - 要素のはみ出し・重なりがないか
   - レスポンシブ対応が適切か（モバイルで横スクロールが発生していないかなど）
   - コンソールにエラーや警告が出ていないか
   - アクセシビリティスナップショットで構造的な異常がないか
   - 視覚的に不自然な点がないか

最終的に、担当ページごとの結果を以下の形式で返してください:

### {ページパス}
- **ステータス**: OK / 問題あり
- **デスクトップ**: 評価コメント
- **モバイル**: 評価コメント
- **コンソール**: エラー・警告の有無と内容
- **問題詳細**（問題ありの場合）: 具体的な問題と対応提案
- **スクリーンショット**: desktop-{パス名}.png, mobile-{パス名}.png
```

### Step 3: レポート統合

すべてのSubAgentの完了を待ち、結果を集約して以下の形式のMarkdownレポートを出力する:

```markdown
# デザインチェックレポート

## サマリー
- チェック日時: {日時}
- チェックページ数: {数}
- 問題検出数: {数}

## ページ別結果

### {ページパス}
- **ステータス**: OK / 問題あり
- **デスクトップ**: 評価コメント
- **モバイル**: 評価コメント
- **コンソール**: エラー・警告の有無
- **問題詳細**（該当時）: 内容と対応提案
- **スクリーンショット**: ファイルパス一覧

（各ページ分繰り返す）

## 総合評価
全体的な所見と推奨アクション
```
