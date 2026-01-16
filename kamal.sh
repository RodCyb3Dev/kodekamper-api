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
  echo "Warning: $SECRETS_FILE not found"
fi

# Run kamal with all arguments passed through
kamal "$@"
