# マイグレーションの適用設定。ディレクトリは `/migrations`、この設定は `/atlas.hcl` に置く前提。
#   - compose: `compose.yaml` が両方をマウントして実行する。
#   - cluster: `backend/Dockerfile.migrate` が両方をイメージに入れる。接続先は backend と同じ `DATABASE_*` 環境変数で受け取る。
# 新しい SQL を足したら、`mise run db:hash` で `migrations/atlas.sum` を更新する。

env "compose" {
  url = "postgres://app:app@db:5432/app?sslmode=disable"
  migration {
    dir = "file:///migrations"
  }
}

env "cluster" {
  url = "postgres://${urlescape(file(getenv("DATABASE_USER_FILE")))}:${urlescape(file(getenv("DATABASE_PASSWORD_FILE")))}@${getenv("DATABASE_HOST")}:${getenv("DATABASE_PORT")}/${file(getenv("DATABASE_NAME_FILE"))}?sslmode=${getenv("DATABASE_SSL_MODE")}&sslrootcert=${getenv("DATABASE_SSL_CA_FILE")}"
  migration {
    dir = "file:///migrations"
  }
}
