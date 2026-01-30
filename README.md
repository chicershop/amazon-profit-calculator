# Amazon販売 利益計算Webアプリ

Amazon販売の利益計算から詳細リサーチ、チャットワーク依頼テキスト生成までを一括で行うWebアプリケーションです。

## 機能

### 1. 利益計算機能
- 商品原価、販売価格、サイズ、重量、Amazon手数料を入力
- 粗利益と粗利益率を自動計算
- コスト内訳を詳細表示

### 2. 判定機能
- 粗利益率30%以上で自動的に詳細リサーチへ
- 30%未満はOK/NGボタンで判定

### 3. 詳細リサーチ入力
- 複数のライバル情報を入力可能
- セラースプライトデータの貼り付け・整形

### 4. チャットワーク依頼テキスト生成
- 商品名自動抽出
- ワンクリックでコピー

### 5. データ保存
- LocalStorageに自動保存
- CSV/JSONエクスポート

### 6. 履歴管理
- リサーチ履歴一覧
- フィルター・検索機能

## セットアップ

### 前提条件
- Node.js 16以上
- npm または yarn

### インストール

```bash
cd amazon-profit-calculator
npm install
```

### 開発サーバー起動

```bash
npm start
```

ブラウザで http://localhost:3000 が自動的に開きます。

### 本番ビルド

```bash
npm run build
```

`build` フォルダに静的ファイルが生成されます。

## 計算ロジック

```
① 商品原価 + オプション = 原価 + 2.5元
② 容積重量(kg) = (縦 × 横 × 高さ) ÷ 6000
   国際配送料 = MAX(実重量, 容積重量) × 7元
③ 関税費用 = (① + ②) × 0.18
④ 仕入れ総コスト（円） = (① + ② + ③) × 23.5
⑤ Amazon手数料（円） = 販売手数料 + 在庫保管手数料 + FBA配送代行手数料
⑥ 総コスト（円） = ④ + ⑤

粗利益（円） = 販売価格 − 総コスト
粗利益率（%） = 粗利益 ÷ 販売価格 × 100
```

## 設定値（デフォルト）

| 項目 | デフォルト値 |
|------|------------|
| オプション費用 | 2.5元 |
| 国際配送単価 | 7元/kg |
| 関税率 | 18% |
| 為替レート | 23.5円/元 |
| 粗利益率基準 | 30% |

設定画面でこれらの値を変更できます。

## ファイル構成

```
amazon-profit-calculator/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── ProfitCalculator.jsx      # 利益計算フォーム
│   │   ├── ProfitResult.jsx          # 計算結果表示
│   │   ├── JudgmentButtons.jsx       # OK/NGボタン
│   │   ├── DetailResearch.jsx        # 詳細リサーチ入力
│   │   ├── CompetitorForm.jsx        # ライバル情報入力
│   │   ├── SellerSpriteInput.jsx     # セラースプライト情報入力
│   │   ├── ChatworkOutput.jsx        # チャットワークテキスト生成
│   │   ├── HistoryList.jsx           # 履歴一覧
│   │   └── Settings.jsx              # 設定画面
│   ├── hooks/
│   │   ├── useLocalStorage.js        # LocalStorage操作
│   │   └── useCalculation.js         # 計算ロジック
│   ├── utils/
│   │   ├── calculator.js             # 利益計算関数
│   │   ├── exportData.js             # CSV/JSONエクスポート
│   │   └── extractProductName.js     # 商品名抽出
│   ├── App.jsx
│   ├── App.css
│   └── index.js
├── package.json
└── README.md
```

## 技術スタック

- React 18
- CSS (カスタムスタイル)
- LocalStorage (データ永続化)

## ライセンス

MIT
