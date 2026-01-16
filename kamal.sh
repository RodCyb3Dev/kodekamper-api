#!/bin/bash
# Kamal deployment wrapper - loads environment variables from .env

set -e

# Load specific variables from .env
export SERVER_IP=$(grep "^STAGING_SERVER_IP=" .env | cut -d'=' -f2)
export REGISTRY_USERNAME=$(grep "^REGISTRY_USERNAME=" .env | cut -d'=' -f2)
export REGISTRY_PASSWORD=$(grep "^REGISTRY_PASSWORD=" .env | cut -d'=' -f2)

# Run kamal with all arguments passed through
kamal "$@"
