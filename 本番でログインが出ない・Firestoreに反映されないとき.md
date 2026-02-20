# 本番でログインが出ない・Firestore に反映されないとき

## いま起きていること

- **本番URL**（https://amazon-profit-calculator-virid.vercel.app/）で **ログイン画面が出ない**
- 利益計算をしても **Firestore のデータベースに反映されない**
- シークレットモードでも通常モードでも **同じ**（ログイン画面なし）

→ 本番の**ビルド**で Firebase が有効になっていません。  
アプリは「Firebase が無効」と判断しているため、ログイン画面を出さず、履歴も Firestore ではなく **ブラウザの localStorage だけ**に保存されています。

---

## 原因になりやすいこと

1. **Vercel の環境変数がビルドに含まれていない**
   - 変数名の typo（例: `STORAGE_BUCKOT` ではなく `STORAGE_BUCKET`）
   - 6つのうち1つでも未設定だと Firebase は有効になりません
   - 環境変数を**追加したあと、新しいビルド（再デプロイ）をしていない**

2. **環境変数が Production に紐づいていない**
   - 各変数で **Production** にチェックが入っているか確認してください

---

## 確認1: 画面で Firebase の状態を見る

アプリの**フッター**に、次のどちらかが表示されます。

- **「Firebase: 有効（履歴は共有されます）」** … 本番で Firebase が有効
- **「Firebase: 無効（履歴はこの端末のみ。共有するには本番の環境変数を確認してください）」** … 本番で Firebase が無効

本番URLを開いて、フッターが「無効」なら、下の「確認2」で環境変数と再デプロイをやり直してください。

---

## 確認2: Vercel の環境変数（名前は完全一致で）

Vercel → プロジェクト **amazon-profit-calculator** → **Settings** → **Environment Variables** で、次の **6つ** が **1文字ずつ同じ名前**で登録されているか確認してください。

| # | 変数名（コピーして使ってください） |
|---|-------------------------------------|
| 1 | `REACT_APP_FIREBASE_API_KEY` |
| 2 | `REACT_APP_FIREBASE_AUTH_DOMAIN` |
| 3 | `REACT_APP_FIREBASE_PROJECT_ID` |
| 4 | `REACT_APP_FIREBASE_STORAGE_BUCKET` |
| 5 | `REACT_APP_FIREBASE_MESSAGING_SENDER_ID` |
| 6 | `REACT_APP_FIREBASE_APP_ID` |

- **4番目は `BUCKET` です。** `BUCKOT` などの typo がないか確認してください。
- 各変数で **Environment** の **Production** にチェックを入れて保存してください。

---

## 確認3: 環境変数追加・変更後は「新しいビルド」が必要

Vercel では、環境変数は **ビルド時** にアプリに埋め込まれます。  
そのため、

1. 上記6つを追加・修正したあと、
2. **必ず「再デプロイ」して、新しいビルドを走らせる**

必要があります。

- **Deployments** タブ → いちばん上の **Production** のデプロイの **⋮** → **Redeploy**
- または、何かコミットを `main` にプッシュして新しいデプロイを作る

「Redeploy」で新しいビルドが走り、そのときに Vercel の環境変数が読み込まれます。

---

## 手順のまとめ

1. **Environment Variables** で上記6つの変数名と Production を確認・修正する  
2. **Redeploy**（または `main` にプッシュ）して新しいビルドを実行する  
3. 本番URLを開き、**フッター**に「Firebase: 有効」と出るか確認する  
4. 有効になっていれば、**ログイン画面**が表示され、ログイン後に保存した内容が **Firestore** に反映されます  

フッターで「有効」になったら、第三者も同じURLでログインすれば、履歴（利益の画面）を共有できます。
