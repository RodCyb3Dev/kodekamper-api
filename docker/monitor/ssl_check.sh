#!/usr/bin/env bash
set -euo pipefail

DOMAINS_CSV=${DOMAINS:-}
THRESHOLD_DAYS=${THRESHOLD_DAYS:-30}
ALERT_WEBHOOK_URL=${ALERT_WEBHOOK_URL:-}
CHECK_URLS_CSV=${CHECK_URLS:-}
TCP_CHECKS_CSV=${TCP_CHECKS:-}

if [[ -z "$DOMAINS_CSV" ]]; then
  echo "No DOMAINS provided; set DOMAINS=example.com,api.example.com"
  exit 0
fi

IFS=',' read -r -a DOMAINS <<< "$DOMAINS_CSV"

notify() {
  local message="$1"
  echo "$message"
  if [[ -n "$ALERT_WEBHOOK_URL" ]]; then
    curl -sS -X POST -H 'Content-Type: application/json' \
      -d "{\"text\": \"$message\"}" \
      "$ALERT_WEBHOOK_URL" >/dev/null || true
  fi
}

check_domain() {
  local domain="$1"
  local enddate
  enddate=$(echo | openssl s_client -servername "$domain" -connect "$domain:443" 2>/dev/null | openssl x509 -noout -enddate | cut -d= -f2 || true)

  if [[ -z "$enddate" ]]; then
    notify "[SSL] Unable to fetch certificate for $domain"
    return 0
  fi

  local end_ts now_ts days_left
  end_ts=$(date -d "$enddate" +%s)
  now_ts=$(date +%s)
  days_left=$(( (end_ts - now_ts) / 86400 ))

  if (( days_left <= THRESHOLD_DAYS )); then
    notify "[SSL] $domain certificate expires in ${days_left} days (threshold: ${THRESHOLD_DAYS})"
  else
    echo "[SSL] $domain OK (${days_left} days remaining)"
  fi
}

for domain in "${DOMAINS[@]}"; do
  check_domain "${domain}"
done

if [[ -n "$CHECK_URLS_CSV" ]]; then
  IFS=',' read -r -a URLS <<< "$CHECK_URLS_CSV"
  for url in "${URLS[@]}"; do
    status=$(curl -sS -o /dev/null -w "%{http_code}" "$url" || echo "000")
    if [[ "$status" == "000" || "$status" -ge 400 ]]; then
      notify "[HTTP] $url unhealthy (status: $status)"
    else
      echo "[HTTP] $url OK (status: $status)"
    fi
  done
fi

if [[ -n "$TCP_CHECKS_CSV" ]]; then
  IFS=',' read -r -a HOSTS <<< "$TCP_CHECKS_CSV"
  for host in "${HOSTS[@]}"; do
    h="${host%:*}"
    p="${host#*:}"
    if timeout 3 bash -c "</dev/tcp/$h/$p" 2>/dev/null; then
      echo "[TCP] $host OK"
    else
      notify "[TCP] $host unreachable"
    fi
  done
fi
