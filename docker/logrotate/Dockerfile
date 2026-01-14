FROM alpine:3.19

RUN apk add --no-cache logrotate tzdata

WORKDIR /opt/logrotate
COPY entrypoint.sh /entrypoint.sh

RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
