#!/usr/bin/env bash
# 使い方: scripts/smoke.sh <image>
# イメージをランダムなローカルポートで起動し、/healthz が成功することを確認して削除する。
set -euo pipefail

image="${1:?usage: smoke.sh <image>}"
cid="$(docker run -d --rm -p 127.0.0.1::8080 "$image")"
trap 'docker rm -f "$cid" >/dev/null 2>&1 || true' EXIT

port="$(docker port "$cid" 8080/tcp | head -n1 | awk -F: '{print $NF}')"

for _ in $(seq 1 30); do
  if curl -fsS "http://127.0.0.1:${port}/healthz" | grep -q '"status":"ok"'; then
    echo "smoke: ok"
    exit 0
  fi
  sleep 1
done

echo "smoke: /healthz did not become healthy" >&2
docker logs "$cid" >&2 || true
exit 1
