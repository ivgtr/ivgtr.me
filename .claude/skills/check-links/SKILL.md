# check-links スキル

サイト内のリンク切れを検出するスキル。Playwright MCPツールで全ページを巡回し、内部リンク・外部リンクの有効性を検証する。

## 引数

`$ARGUMENTS` でチェック対象のパスを指定可能（例: `/articles`）。省略時は全ページを巡回する。

## 手順

### Step 1: 開発サーバー確認

`mcp__playwright__browser_navigate` で `http://localhost:3000` にアクセスし、開発サーバーが起動しているか確認する。

- **起動していない場合**: Bashツールで `npm run dev` をバックグラウンド実行（`run_in_background: true`）し、`mcp__playwright__browser_wait_for` で数秒待ってからリトライする。
- **起動している場合**: そのまま次のステップへ進む。

### Step 2: SubAgentを使った並列チェック

Taskツール（`subagent_type: "general-purpose"`）を使ってSubAgentを並列起動する。

#### 引数なし（全ページ巡回）の場合

以下の2つのSubAgentを**1つのメッセージで同時に**起動する:

- **SubAgent 1（内部リンクチェック）**: `/`, `/articles`, `/tools` およびツールページ全て
- **SubAgent 2（外部リンクチェック）**: 各ページから抽出した外部リンクの検証

#### 引数あり（特定ページ指定）の場合

指定されたパスのみをSubAgent 1つに委譲する。

#### 各SubAgentへのプロンプト

**SubAgent 1（内部リンク）:**

```
以下のページの内部リンクをチェックしてください。

対象ページ: /, /articles, /tools, /tools/crop-icon, /tools/glitch-image, /tools/image-to-base64, /tools/pixel-image, /tools/side-scroller-game, /tools/tategaki, /tools/x-character-prompt-generator
ベースURL: http://localhost:3000

各ページについて以下を実行:

1. `mcp__playwright__browser_navigate` でページに遷移
2. `mcp__playwright__browser_snapshot` でアクセシビリティスナップショットを取得
3. スナップショットからすべてのリンク（aタグ）を抽出
4. 内部リンク（localhost:3000 または相対パス）をリスト化
5. 各内部リンク先に `mcp__playwright__browser_navigate` で遷移し、ページが正常に表示されるか確認
6. `mcp__playwright__browser_console_messages` で level: "error" のコンソールエラーを確認

結果を以下の形式で返してください:

### 内部リンクチェック結果
| ページ | リンクテキスト | リンク先 | ステータス |
|--------|-------------|---------|-----------|
| /      | ツール       | /tools  | OK        |

### 問題のあるリンク
（問題がある場合のみ詳細を記述）
```

**SubAgent 2（外部リンク）:**

```
以下のページの外部リンクをチェックしてください。

対象ページ: /, /articles, /tools
ベースURL: http://localhost:3000

各ページについて以下を実行:

1. `mcp__playwright__browser_navigate` でページに遷移
2. `mcp__playwright__browser_snapshot` でアクセシビリティスナップショットを取得
3. スナップショットからすべての外部リンク（localhost以外のURL）を抽出
4. 各外部リンクに `mcp__playwright__browser_navigate` で遷移し、ページが正常に読み込まれるか確認（タイムアウトやエラーがないか）
5. 確認後 `mcp__playwright__browser_navigate_back` で戻る

結果を以下の形式で返してください:

### 外部リンクチェック結果
| ページ | リンクテキスト | リンク先URL | ステータス |
|--------|-------------|------------|-----------|

### 問題のあるリンク
（問題がある場合のみ詳細を記述）
```

### Step 3: レポート統合

すべてのSubAgentの完了を待ち、結果を集約して以下の形式で出力する:

```markdown
# リンクチェックレポート

## サマリー
- チェック日時: {日時}
- 内部リンク数: {数} （問題: {数}）
- 外部リンク数: {数} （問題: {数}）

## 内部リンク結果
（SubAgent 1の結果）

## 外部リンク結果
（SubAgent 2の結果）

## 要対応項目
問題のあるリンクの一覧と修正提案
```
