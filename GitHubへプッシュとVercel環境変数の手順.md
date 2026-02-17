# 最新の情報を GitHub にプッシュする手順 ＋ Vercel で Firebase 環境変数を入れる手順

---

# パート1: 最新の情報を GitHub にプッシュする

## やることの意味

- **あなたのパソコン** にある「いまのコード」を、**GitHub のリポジトリ** に送ることを **プッシュ** といいます。
- プッシュすると、GitHub が最新のコードになり、Vercel がそのコードを読み取って **本番のサイト**（amazon-profit-calculator-virid.vercel.app）を更新します。

---

## ステップ1: ターミナルを開く

1. **Cursor** でプロジェクト **amazon-profit-calculator** を開いた状態にします。
2. メニュー **「ターミナル」** → **「新しいターミナル」** をクリックします。
3. 画面下（または横）に **黒い画面（ターミナル）** が表示されます。

---

## ステップ2: プロジェクトのフォルダに移動する

ターミナルに、次の **1行** を貼り付けて **Enter** を押します。

```powershell
cd c:\Users\KH060\amazon-profit-calculator
```

---

## ステップ3: 変更をすべて「ステージング」する

次の **1行** を入力して **Enter** を押します。

```powershell
git add .
```

- ピリオド **.** を忘れずに付けます。
- 「変更をコミットの対象にする」という意味です。

---

## ステップ4: コミットする（変更に名前をつけて記録する）

次の **1行** を入力して **Enter** を押します。  
**" "** の中は、何を更新したか分かる短い説明に変えてかまいません。

```powershell
git commit -m "Firebaseで共有・承認機能を追加"
```

- これで「この内容で保存しました」と Git に記録されます。まだ GitHub には送っていません。

---

## ステップ5: GitHub にプッシュする

次の **1行** を入力して **Enter** を押します。

```powershell
git push origin main
```

- **main** の部分は、ブランチ名です。もし **master** と表示される環境なら、`git push origin master` にします。
- ここで **GitHub の認証**（ユーザー名・パスワードまたは Personal Access Token）を求められたら、入力します。
- 「Writing objects: 100%」や「done」のような表示が出れば **プッシュ成功** です。

---

## プッシュ後の確認

1. ブラウザで **https://github.com/chicershop/amazon-profit-calculator** を開きます。
2. **最新のコミット**（いま付けた「Firebaseで共有・承認機能を追加」など）が一番上に表示されていればOKです。
3. Vercel と連携していれば、数分以内に **本番サイト**（https://amazon-profit-calculator-virid.vercel.app）が自動で再デプロイされます。

---

# パート2: Vercel で Firebase の環境変数を入れる

## なぜ必要か

- あなたのパソコンでは **.env** に Firebase の設定（APIキーなど）を書いているので、ローカルでは Firebase に接続できます。
- **Vercel のサーバー** でビルド・実行する本番サイトには、あなたの .env は渡りません。
- そのため、**Vercel の画面で同じ内容を「環境変数」として登録** する必要があります。  
  登録しないと、本番のURLではログインやデータ共有（Firebase）が動きません。

---

## ステップ1: Vercel にログインする

1. ブラウザで **https://vercel.com** を開きます。
2. **GitHub でログイン** している場合は、そのままログインします。
3. ダッシュボード（自分のプロジェクト一覧）が表示されます。

---

## ステップ2: 該当プロジェクトを開く

1. 一覧から **「amazon-profit-calculator」** をクリックします。
2. プロジェクトの詳細画面になります。

---

## ステップ3: 設定（Settings）を開く

1. 画面上方のタブで **「Settings」** をクリックします。
2. 左のメニューで **「Environment Variables」** をクリックします。

---

## ステップ4: 6つの環境変数を1つずつ追加する

あなたの **.env** に書いた値（または Firebase コンソールでメモした値）を、次の **6つ** を **1つずつ** 追加します。

### 追加のしかた（1つ目を例に）

1. **「Key」** の欄に、次の名前を **そのまま** 入力します。  
   `REACT_APP_FIREBASE_API_KEY`
2. **「Value」** の欄に、**.env の REACT_APP_FIREBASE_API_KEY= の右側の値** を貼り付けます。  
   （前後にスペースや " " は付けません。）
3. **Environment** で **Production**（と、必要なら Preview）にチェックを入れます。
4. **「Save」** をクリックします。

### 残り5つも同じ要領で追加する

| Key（名前） | Value（値の取り方） |
|-------------|----------------------|
| `REACT_APP_FIREBASE_API_KEY` | .env の同じ行の「=」の右側 |
| `REACT_APP_FIREBASE_AUTH_DOMAIN` | 同上 |
| `REACT_APP_FIREBASE_PROJECT_ID` | 同上 |
| `REACT_APP_FIREBASE_STORAGE_BUCKET` | 同上 |
| `REACT_APP_FIREBASE_MESSAGING_SENDER_ID` | 同上 |
| `REACT_APP_FIREBASE_APP_ID` | 同上 |

- **Key** は上記の文字列を **1文字も違えず** 入力します。
- **Value** は、あなたの .env または Firebase コンソールの「プロジェクトの設定」→「マイアプリ」で表示された値です。
- 6つすべて **Save** して保存します。

---

## ステップ5: 再デプロイする（環境変数を反映させる）

環境変数を追加・変更したあとは、**もう一度デプロイ** しないと本番に反映されません。

1. 同じプロジェクト画面の上のタブで **「Deployments」** をクリックします。
2. 一番上にある **最新のデプロイ** の行の **右端の「︙」（縦三点）** をクリックします。
3. **「Redeploy」** を選びます。
4. 確認画面で **「Redeploy」** を再度クリックします。
5. 数分待つと、**本番サイトに Firebase の設定が反映** されます。

---

## うまくいかないとき

- **プッシュで「Permission denied」などと出る**  
  → GitHub にログインし直すか、Personal Access Token を設定して、もう一度 `git push origin main` を試します。
- **Vercel に「Environment Variables」がない**  
  → 左メニューの名前が **「Environment Variables」** や **「Env」** などになっていることがあります。その項目を開きます。
- **本番サイトでログインできない**  
  → 6つすべて正しい Key で登録したか、Value に余計なスペースや " " が入っていないか確認し、**Redeploy** を実行したか確認します。

---

## まとめ

| 順番 | やること |
|------|----------|
| 1 | ターミナルで `cd c:\Users\KH060\amazon-profit-calculator` |
| 2 | `git add .` |
| 3 | `git commit -m "Firebaseで共有・承認機能を追加"` |
| 4 | `git push origin main` |
| 5 | Vercel → プロジェクト → Settings → Environment Variables で 6つ追加 |
| 6 | Deployments → 最新のデプロイの「Redeploy」で再デプロイ |

これで、**最新のコードが GitHub にプッシュ** され、**本番サイトで Firebase（ログイン・データ共有）が動く** 状態になります。
