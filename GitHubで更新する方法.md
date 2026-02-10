# GitHub でサイトを更新する方法

リポジトリ **chicershop / amazon-profit-calculator** はすでに GitHub にあり、Vercel（amazon-profit-calculator-virid.vercel.app）で公開されています。

**更新の流れ:** ローカルで変更 → コミット → GitHub にプッシュ → Vercel が自動で再デプロイ

---

## ステップ1: ターミナルを開く

1. Cursor でプロジェクト **amazon-profit-calculator** を開いた状態にします。
2. メニュー **「ターミナル」** → **「新しいターミナル」** を選びます。

---

## ステップ2: プロジェクトのフォルダに移動する

ターミナルに次のコマンドを入力して **Enter** を押します。

```powershell
cd c:\Users\KH060\amazon-profit-calculator
```

（プロジェクトを別の場所に保存している場合は、そのパスに書き換えてください。）

---

## ステップ3: 変更内容を確認する

次のコマンドで、どのファイルが変更されているか確認できます。

```powershell
git status
```

- 変更したファイルや新しく追加したファイルの一覧が表示されます。

---

## ステップ4: 変更を「ステージング」する

すべての変更をいったん「コミットの対象」にします。

```powershell
git add .
```

- ピリオド（`.`）は「カレントフォルダ内の変更すべて」という意味です。
- 特定のファイルだけ追加したい場合は、`git add ファイル名` のように指定します。

---

## ステップ5: コミットする（変更に説明をつけて記録する）

「いまの変更をひとまとまりとして記録する」ためにコミットします。

```powershell
git commit -m "更新内容の短い説明"
```

**例:**

```powershell
git commit -m "FBA手数料自動計算・特記仕様の移動・1688URL追加"
```

- `-m` の後ろの **" "** の中に、何を変えたか分かる短い説明を日本語で書きます。
- ここまでで、変更は**あなたのパソコン内**にだけ保存された状態です。

---

## ステップ6: GitHub にプッシュする

ローカルのコミットを GitHub のリポジトリに送ります。

```powershell
git push origin main
```

- ブランチ名が **master** の場合は、次のようにします。  
  `git push origin master`
- 初回や認証が必要な場合は、**GitHub のユーザー名とパスワード（または Personal Access Token）** の入力や、ブラウザでのサインインを求められることがあります。

**成功すると:**

- ターミナルに `Writing objects: 100%` や `done` のような表示が出ます。
- GitHub の **chicershop/amazon-profit-calculator** のページを開くと、新しいコミットが反映されています。

---

## ステップ7: 公開サイトの更新を確認する

- このリポジトリが **Vercel** と連携している場合、**main（または master）にプッシュすると、自動で再デプロイ**されます。
- 1〜2分ほど待ってから、**https://amazon-profit-calculator-virid.vercel.app** を開き、表示や動作が更新されているか確認します。
- Vercel のダッシュボード（https://vercel.com）で「Deployments」を見ると、最新のデプロイの状態（成功・失敗）が分かります。

---

## よくあること

### 「git は認識されていません」と出る

- **Git** がインストールされていません。
- https://git-scm.com/ からインストールし、Cursor を一度終了してから開き直して、もう一度手順を試してください。

### プッシュ時に「Permission denied」や「Authentication failed」と出る

- GitHub へのログイン（認証）が必要です。
- **Personal Access Token** を使う方法が一般的です。
  1. GitHub にログイン → 右上のアイコン → **Settings**
  2. 左メニュー下の **Developer settings** → **Personal access tokens**
  3. **Generate new token** でトークンを作成し、**コピー**
  4. プッシュ時にパスワードを聞かれたら、**そのトークンを貼り付けて**使います。
- または、**GitHub Desktop** や **Git Credential Manager** でサインインしておく方法もあります。

### ブランチ名が main か master か分からない

- ターミナルで次を実行すると、今いるブランチ名が表示されます。  
  `git branch`
- 表示されているブランチ名を `git push origin ブランチ名` のところに使います。

---

## 更新手順のまとめ（毎回やること）

1. コードやドキュメントを編集して保存する。
2. ターミナルで `cd c:\Users\KH060\amazon-profit-calculator`（必要なら）
3. `git add .`
4. `git commit -m "〇〇を変更"`
5. `git push origin main`（ブランチが main の場合）
6. 1〜2分待ってから Vercel のURLで表示を確認する。

これで GitHub 上のリポジトリと、Vercel で公開しているサイトの両方が更新されます。
