#!/bin/bash
# Kamal deployment wrapper - loads environment variables from .kamal/secrets.*

set -e

# Determine which secrets file to use based on -d flag
SECRETS_FILE=".kamal/secrets"
for arg in "$@"; do
  if [[ "$prev_arg" == "-d" ]]; then
    SECRETS_FILE=".kamal/secrets.$arg"
    break
  fi
  prev_arg="$arg"
done

# Source the secrets file if it exists
if [ -f "$SECRETS_FILE" ]; then
  set -a  # Auto-export all variables
  source "$SECRETS_FILE"
  set +a
else
  echo "Error: $SECRETS_FILE not found" >&2
  echo "Create it (gitignored) or pass -d <destination> to use .kamal/secrets.<destination>." >&2
  exit 1
fi

# Fail fast if required vars aren't present. These are used during ERB evaluation in deploy configs.
if [[ -z "${SERVER_IP:-}" ]]; then
  echo "Error: SERVER_IP is not set after sourcing $SECRETS_FILE" >&2
  echo "Fix: add SERVER_IP=<your_server_ip> to $SECRETS_FILE, or export SERVER_IP in your shell." >&2
  exit 1
fi

# Run kamal with all arguments passed through
kamal "$@"
