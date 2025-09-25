#!/bin/sh
set -e

# Determine DB host/port from env vars or DATABASE_URL
HOST="${PGHOST:-}"
PORT="${PGPORT:-}"

if [ -z "$HOST" ]; then
  if [ -n "$DATABASE_URL" ]; then
    HOST=$(echo "$DATABASE_URL" | sed -E 's|.*@([^:/]+).*|\1|')
    PORT=$(echo "$DATABASE_URL" | sed -E 's|.*:([0-9]+)/.*|\1|')
  fi
fi

HOST="${HOST:-db}"
PORT="${PORT:-5432}"

echo "Waiting for Postgres at ${HOST}:${PORT} ..."

# Wait until DB is reachable
while ! nc -z "$HOST" "$PORT"; do
  echo "Postgres not ready - sleeping"
  sleep 1
done

echo "Postgres available - running migrations (if configured)"

# Run migrations if script exists
if [ -f package.json ]; then
  if npm run migrate --silent; then
    echo "Migrations finished"
  else
    echo "Migrations failed or not configured — continuing"
  fi
fi

echo "Starting server"
exec node server.js