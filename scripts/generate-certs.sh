#!/bin/bash
# Generate local HTTPS certificates using mkcert
# Prerequisites: brew install mkcert && mkcert -install

set -e

DOMAIN="mac-perso-ora.test"
CERT_DIR="certificates"

mkdir -p "$CERT_DIR"

# App certificate (Next.js dev server)
mkcert -key-file "$CERT_DIR/$DOMAIN-key.pem" -cert-file "$CERT_DIR/$DOMAIN.pem" "$DOMAIN"

echo ""
echo "✅ Certificate generated in $CERT_DIR/"
echo "   App: $CERT_DIR/$DOMAIN.pem"
echo ""
echo "🚀 Next steps:"
echo "   1. docker compose -f env-local/docker-compose.yml up -d"
echo "   2. npm run dev"
echo "   3. Open https://$DOMAIN:3000"
echo "   4. Keycloak admin: http://keycloak.test:8080"
