#!/usr/bin/env sh
set -eu

CRON_SCHEDULE=${CRON_SCHEDULE:-"0 * * * *"}

cat <<EOF > /etc/crontabs/root
${CRON_SCHEDULE} /usr/sbin/logrotate -v /etc/logrotate.d/nginx >/var/log/logrotate.log 2>&1
EOF

crond -f -l 2
