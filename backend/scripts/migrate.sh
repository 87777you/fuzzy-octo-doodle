#!/bin/sh
# backend/migrations/*.sql を番号順に適用する。適用済みのものは schema_migrations に記録し、再実行しても飛ばす。
# 使い方: compose の `migrate` サービスが実行する（手で実行するなら PG* 環境変数を設定する）。
set -eu

psql -v ON_ERROR_STOP=1 -q -c "CREATE TABLE IF NOT EXISTS schema_migrations (name text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())"

for file in /migrations/*.sql; do
  name=$(basename "$file")
  applied=$(psql -v ON_ERROR_STOP=1 -tA -c "SELECT 1 FROM schema_migrations WHERE name = '$name'")
  if [ -n "$applied" ]; then
    echo "skip   $name"
    continue
  fi
  # 1 ファイルを 1 トランザクションで適用し、成功したときだけ記録する。途中で失敗したら全体を戻す。
  psql -v ON_ERROR_STOP=1 -q -1 -f "$file" -c "INSERT INTO schema_migrations (name) VALUES ('$name')"
  echo "apply  $name"
done
