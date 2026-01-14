#!/usr/bin/env sh
set -eu

: "${DOMAIN:?DOMAIN is required}"
: "${CERTBOT_EMAIL:?CERTBOT_EMAIL is required}"

if [ ! -d "/etc/letsencrypt/live/${DOMAIN}" ]; then
  echo "Creating initial certificates for ${DOMAIN}"
  certbot certonly \
    --webroot \
    --webroot-path /var/www/certbot \
    --email "$CERTBOT_EMAIL" \
    --agree-tos \
    --no-eff-email \
    -d "$DOMAIN" \
    ${CERTBOT_EXTRA_ARGS:-}
fi

nginx -s reload
