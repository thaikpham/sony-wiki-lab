#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
APP_DIR="$ROOT_DIR/apps/web"
PORT="${PHOTOBOOTH_SMOKE_PORT:-3200}"
BASE_URL="http://127.0.0.1:${PORT}"
START_LOG="${TMPDIR:-/tmp}/photobooth-smoke-start.log"
SERVER_PID=""

cleanup() {
  if [[ -n "${SERVER_PID}" ]]; then
    kill "${SERVER_PID}" >/dev/null 2>&1 || true
    wait "${SERVER_PID}" >/dev/null 2>&1 || true
  fi
}

trap cleanup EXIT

wait_for_server() {
  local attempts=0

  until curl -fsS "${BASE_URL}/photobooth" >/dev/null 2>&1; do
    attempts=$((attempts + 1))
    if [[ "${attempts}" -ge 30 ]]; then
      echo "Photobooth smoke server failed to become ready on ${BASE_URL}" >&2
      cat "${START_LOG}" >&2 || true
      exit 1
    fi
    sleep 1
  done
}

assert_status() {
  local label="$1"
  local url="$2"
  local expected="$3"
  local actual

  actual="$(curl -sS -o /dev/null -w '%{http_code}' "${url}")"
  if [[ "${actual}" != "${expected}" ]]; then
    echo "Smoke check failed for ${label}: expected ${expected}, got ${actual}" >&2
    exit 1
  fi
}

assert_body_contains() {
  local label="$1"
  local url="$2"
  local pattern="$3"
  local body

  body="$(curl -fsS "${url}")"
  if ! grep -Fq "${pattern}" <<<"${body}"; then
    echo "Smoke check failed for ${label}: missing pattern '${pattern}'" >&2
    exit 1
  fi
}

cd "${APP_DIR}"
npm run start -- --port "${PORT}" >"${START_LOG}" 2>&1 &
SERVER_PID="$!"

wait_for_server

assert_status "overview page" "${BASE_URL}/photobooth" "200"
assert_status "capture page" "${BASE_URL}/photobooth/capture" "200"
assert_status "gallery page" "${BASE_URL}/photobooth/gallery" "200"
assert_status "review page" "${BASE_URL}/photobooth/review/session-0825" "200"
assert_status "share page" "${BASE_URL}/photobooth/share/session-0825" "200"

assert_status "releases api" "${BASE_URL}/api/photobooth/releases/latest" "200"
assert_status "gallery api when host unavailable" "${BASE_URL}/api/photobooth/gallery" "503"
assert_status "share api when host unavailable" "${BASE_URL}/api/photobooth/share/session-0825" "503"
assert_status "public session api when host unavailable" "${BASE_URL}/api/photobooth/public/session/session-0825" "503"

assert_body_contains "overview unavailable banner" "${BASE_URL}/photobooth" "Booth Host Unavailable"
assert_body_contains "capture unavailable state" "${BASE_URL}/photobooth/capture" "Capture workspace needs a live booth host"
assert_body_contains "gallery unavailable state" "${BASE_URL}/photobooth/gallery" "Gallery needs the local booth host"
assert_body_contains "share unavailable state" "${BASE_URL}/photobooth/share/session-0825" "Public share route needs the local booth host"

echo "Photobooth smoke checks passed on ${BASE_URL}"
