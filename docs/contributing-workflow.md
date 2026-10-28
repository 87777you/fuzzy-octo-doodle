# Issue をもらってから PR がマージされるまで

Issue を割り当てられてから、PR がマージされるまでの手順。Git の操作と、PR の出し方、レビューへの対応を説明する。

```text
Issue を確認 → ブランチを作る → 実装・確認 → コミット → Draft の PR → Ready にする → レビュー → 修正 → 再レビュー → マージ
```

用語: **Draft** は「まだレビューを求めない」状態の PR。**Ready for review** にすると、レビューを求めたことになる。

## 0. 最初に一度だけ

1. リポジトリをクローンする。
2. 開発環境を整える: [backend-dev-environment.md](backend-dev-environment.md)(Docker Engine が必要)。
3. 実装の考え方を読む: [onboarding-usecase.md](onboarding-usecase.md)。
4. Git に名前とメールアドレスを設定する(コミットに載る)。

```bash
git config --global user.name "あなたの名前"
git config --global user.email "GitHub に登録したメールアドレス"
```

## 1. Issue を割り当てられたら

1. Issue を開き、本文を最後まで読む。特に「変更するファイル」と「完了条件」。
2. 分からないことは、着手する前に Issue のコメントか Discord で聞く。
3. 1 人が同時に進める Issue は 1 つにする。

## 2. ブランチを作る

`main` を最新にしてから、そこから新しいブランチを作る。`main` に直接コミットしない。

```bash
git switch main
git pull
git switch -c feat/<Issue 番号>-<内容の短い英語>
# 例: git switch -c feat/46-create-objection
```

- ブランチ名の先頭は、内容に合わせる: `feat/`(機能)、`fix/`(不具合の修正)、`docs/`(文書)。
- 1 つの Issue に、1 つのブランチと 1 つの PR を作る。Issue の範囲を超える変更は、別の Issue にする。

## 3. 実装して確認する

1. 開発環境を起動する: `docker compose up --build --watch`(`backend/src` を変更すると自動で反映される)。
2. [onboarding-usecase.md](onboarding-usecase.md) の「実装の進め方」に沿って、`todo(` を実装に置き換える。
3. `curl` で動作を確認する。確認した手順と結果を、PR に書くために控えておく。
4. PR の前に、リポジトリのルートで次の 4 つを実行し、すべて成功させる。

```bash
pnpm exec eslint .
pnpm -r typecheck
pnpm -r test
pnpm -r build
```

## 4. コミットする

まとまりごとに、小さくコミットする。

```bash
git status                    # 変更したファイルを確認する
git add <ファイル>             # 関係するファイルだけを追加する
git commit -m "feat(backend): 通知の一覧を取得する"
```

- メッセージの形式: `種類(範囲): 何をしたか`。種類は `feat`、`fix`、`docs`、`refactor`、`test`。範囲は `backend` など。
- `.env` やパスワードなどの秘密の値は、コミットしない。`git status` で、意図しないファイルが入っていないか確認する。
- まだ PR を出さなくても、こまめに push しておくと、手元の事故でも作業を失わない。

```bash
git push -u origin HEAD       # 初回。2 回目からは git push だけでよい
```

## 5. PR を出す(まず Draft)

**PR は、最初は必ず Draft で作る。** このリポジトリは、PR を **Ready for review** にした瞬間に、担当のレビュワーへレビューの依頼が自動で飛ぶ(`.github/CODEOWNERS`)。未完成の状態で Ready にすると、レビュワーの時間を無駄にする。

### Draft で作る

GitHub の画面: push したあとの黄色いバナー「Compare & pull request」を押し、作成ボタンの横の `▼` から **Create draft pull request** を選ぶ。

コマンド:

```bash
gh pr create --draft --title "feat(backend): 通知の一覧を取得する" --body-file <本文のファイル>
```

### Draft を使う状況

- 実装の途中で、CI(自動検証)の結果を確認したいとき。
- 方針に迷っていて、コードを見せながら相談したいとき。
- 動作確認や説明がまだ書けていないとき。
- 実装は終わったが、自分で差分を見直していないとき。

### PR の本文

次の形で書く。会話の経緯や作業中のメモは書かない。読む人が、この PR だけで理解できるようにする。

```markdown
## 概要
何を実装したか(1〜2 文)。

Closes #<Issue 番号>

## 変更内容
- `ファイルのパス` — どう変えたか。

## 動作確認
実行したコマンドと、その結果。
(例: `curl -i http://127.0.0.1:8080/api/notifications` → 200、本文の抜粋)

## 気になる点・相談
判断に迷った箇所、仕様と食い違った箇所。なければ「なし」。
```

- `Closes #番号` と書くと、PR がマージされたときに、Issue が自動で閉じる。
- 動作確認が書けないときは、書けない理由を書く。

### Ready for review にする条件

次のすべてを満たしてから、**Ready for review** にする(PR の下の方の `Ready for review` ボタン)。

- [ ] 変更したファイルから `todo(` が 0 件になっている。
- [ ] 上の 4 つのコマンドが成功し、GitHub の CI(PR の Checks)も成功している。
- [ ] 自分で PR の `Files changed` を通して読み、不要な変更(デバッグ用のコードなど)がない。
- [ ] 本文に、動作確認の手順と結果が書いてある。
- [ ] Issue の範囲だけを変更している。

## 6. PR を出したあと

### レビューが来たら

1. 指摘のコメントを読む。意図が分からないときは、そのコメントに返信して聞く。
2. 同じブランチで修正し、コミットして push する。PR は自動で更新される。新しい PR は作らない。
3. 履歴を書き換える操作(`git push --force`、`git rebase` など)は、しない。レビュワーが、どこが変わったか追えなくなる。
4. 指摘のコメントごとに、対応した内容を返信する(例: 「関数に分けました (コミットの hash)」)。対応しない場合は、その理由を書く。
5. すべて対応したら、**再レビューを依頼する**(次項)。

### 再レビューを依頼する

修正を push しただけでは、レビュワーに通知が行かない。

- GitHub の画面: PR の右側の `Reviewers` で、レビュワーの名前の横にある更新のアイコン(**Re-request review**)を押す。
- コマンド: `gh pr edit <PR 番号> --add-reviewer <レビュワーの GitHub ユーザー名>`

### CI が失敗したら

PR の `Checks` で、失敗したものを開いてログを読む。手元で同じコマンド(上の 4 つ)を実行して再現し、直して push する。原因が分からないときは、ログの該当部分を貼って Discord で聞く。

### main が進んで、コンフリクトと表示されたら

```bash
git fetch
git merge origin/main        # 競合したファイルを直す
git add <直したファイル>
git commit                   # マージのコミットを作る
git push
```

競合の直し方に自信がないときは、直す前に Discord で聞く。

### 承認(Approve)されたら

マージはレビュワーが行う。自分でマージしない。

### マージされたら

1. 画面の `Delete branch` で、リモートのブランチを削除する(自動では消えない)。
2. 手元を最新にして、次の Issue に進む。

```bash
git switch main
git pull
git branch -d feat/<ブランチ名>
```

## 困ったとき

Git の操作で、元に戻せなくなりそうなときは、操作を止めて、Discord で状況(`git status` の出力)を貼って聞く。
