FROM alpine:3.19

RUN apk add --no-cache bash curl openssl tzdata coreutils

WORKDIR /opt/monitor
COPY ssl_check.sh /opt/monitor/ssl_check.sh
COPY entrypoint.sh /entrypoint.sh

RUN chmod +x /opt/monitor/ssl_check.sh /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
