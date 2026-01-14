#!/usr/bin/env sh
set -eu

CRON_SCHEDULE=${CRON_SCHEDULE:-"0 3 * * *"}

mkdir -p /var/log

cat <<EOF > /etc/crontabs/root
${CRON_SCHEDULE} /opt/monitor/ssl_check.sh >> /var/log/ssl_check.log 2>&1
EOF

crond -f -l 2
