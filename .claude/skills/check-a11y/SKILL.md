# check-a11y スキル

アクセシビリティ（a11y）を監査するスキル。Playwright MCPツールでページを巡回し、アクセシビリティスナップショットとDOM評価を使って問題を検出する。

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

以下の2つのSubAgentを**1つのメッセージで同時に**起動する:

- **SubAgent 1**: `/`, `/articles`, `/tools` および `/tools/crop-icon`, `/tools/glitch-image`
- **SubAgent 2**: `/tools/image-to-base64`, `/tools/pixel-image`, `/tools/side-scroller-game`, `/tools/tategaki`, `/tools/x-character-prompt-generator`

#### 引数あり（特定ページ指定）の場合

指定されたパスのみをSubAgent 1つに委譲する。

#### 各SubAgentへのプロンプトテンプレート

各SubAgentには以下のプロンプトを渡す（`{PAGES}` を担当ページリストに置換）:

```
以下のページのアクセシビリティ監査を実施してください。

対象ページ: {PAGES}
ベースURL: http://localhost:3000

各ページについて以下の手順を実行してください:

1. **ページ読み込み**
   - `mcp__playwright__browser_resize` で width: 1280, height: 800 に設定
   - `mcp__playwright__browser_navigate` でページに遷移
   - `mcp__playwright__browser_snapshot` でアクセシビリティスナップショットを取得

2. **見出し構造の確認**
   - アクセシビリティスナップショットから見出し（h1〜h6）の階層を抽出
   - h1が1つだけ存在するか確認
   - 見出しレベルが飛んでいないか（h1→h3のように）確認

3. **画像のalt属性チェック**
   - `mcp__playwright__browser_evaluate` で以下を実行:
     ```javascript
     () => {
       const images = document.querySelectorAll('img');
       return Array.from(images).map(img => ({
         src: img.src.substring(img.src.lastIndexOf('/') + 1),
         alt: img.alt,
         hasAlt: img.hasAttribute('alt'),
         width: img.naturalWidth,
         height: img.naturalHeight
       }));
     }
     ```
   - alt属性が空または未設定の画像を報告

4. **フォーム要素のラベルチェック**
   - `mcp__playwright__browser_evaluate` で以下を実行:
     ```javascript
     () => {
       const inputs = document.querySelectorAll('input, select, textarea');
       return Array.from(inputs).map(el => ({
         type: el.type || el.tagName.toLowerCase(),
         id: el.id,
         name: el.name,
         hasLabel: !!el.labels?.length || !!el.getAttribute('aria-label') || !!el.getAttribute('aria-labelledby'),
         placeholder: el.placeholder
       }));
     }
     ```
   - ラベルのないフォーム要素を報告

5. **インタラクティブ要素のチェック**
   - `mcp__playwright__browser_evaluate` で以下を実行:
     ```javascript
     () => {
       const issues = [];
       // クリック可能だがbutton/aでない要素
       document.querySelectorAll('[onclick], [role="button"]').forEach(el => {
         if (el.tagName !== 'BUTTON' && el.tagName !== 'A') {
           issues.push({
             type: 'non-semantic-interactive',
             tag: el.tagName,
             text: el.textContent?.substring(0, 50),
             hasTabindex: el.hasAttribute('tabindex')
           });
         }
       });
       // tabindexが不適切な要素
       document.querySelectorAll('[tabindex]').forEach(el => {
         const val = parseInt(el.getAttribute('tabindex'));
         if (val > 0) {
           issues.push({
             type: 'positive-tabindex',
             tag: el.tagName,
             tabindex: val,
             text: el.textContent?.substring(0, 50)
           });
         }
       });
       return issues;
     }
     ```

6. **レトロ要素の特別チェック**（このサイト固有）
   - 点滅テキスト（BlinkingText）の存在確認: `prefers-reduced-motion` 対応しているか
   - マーキー（Marquee）の存在確認: 一時停止可能か
   - `mcp__playwright__browser_evaluate` で以下を実行:
     ```javascript
     () => {
       const styles = Array.from(document.styleSheets).flatMap(sheet => {
         try {
           return Array.from(sheet.cssRules).map(rule => rule.cssText);
         } catch { return []; }
       });
       return {
         hasReducedMotion: styles.some(s => s.includes('prefers-reduced-motion')),
         hasAnimations: styles.filter(s => s.includes('@keyframes')).length,
         marqueeElements: document.querySelectorAll('[class*="marquee"], [class*="Marquee"], marquee').length
       };
     }
     ```

7. **キーボードナビゲーションテスト**
   - `mcp__playwright__browser_press_key` で Tab キーを数回押す
   - フォーカスが見える（フォーカスリングがある）か確認
   - `mcp__playwright__browser_snapshot` で各Tabフォーカス後のスナップショットを取得し、フォーカス順序が論理的か確認

結果を以下の形式で返してください:

### {ページパス}
- **見出し構造**: OK / 問題あり（詳細）
- **画像alt属性**: OK / 問題あり（該当画像リスト）
- **フォームラベル**: OK / 問題あり（該当要素リスト）
- **インタラクティブ要素**: OK / 問題あり（詳細）
- **アニメーション/モーション**: OK / 問題あり（reduced-motion対応状況）
- **キーボードナビゲーション**: OK / 問題あり（詳細）
- **その他**: 追加の所見
```

### Step 3: レポート統合

すべてのSubAgentの完了を待ち、結果を集約して以下の形式で出力する:

```markdown
# アクセシビリティ監査レポート

## サマリー
- チェック日時: {日時}
- チェックページ数: {数}
- 問題検出数: {数}（Critical: {数}, Warning: {数}, Info: {数}）

## 問題の重要度分類
- **Critical**: 操作不能・情報アクセス不可になる問題（ラベルなしフォーム、alt未設定の意味のある画像）
- **Warning**: UX低下につながる問題（見出し階層の乱れ、reduced-motion未対応）
- **Info**: 改善推奨（ベストプラクティスとの差異）

## ページ別結果

### {ページパス}
（各チェック項目の結果）

## 総合評価と推奨対応
優先度順の改善提案
```
