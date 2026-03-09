#!/bin/bash
# Generate local HTTPS certificates using mkcert
# Prerequisites: brew install mkcert && mkcert -install

set -e

DOMAIN="mac-perso-ora.test"
AUTH_DOMAIN="keycloak.test"
CERT_DIR="certificates"

mkdir -p "$CERT_DIR"

# Copy mkcert root CA (needed for Node.js to trust local certs)
cp "$(mkcert -CAROOT)/rootCA.pem" "$CERT_DIR/mkcert-rootCA.pem"

# App certificate (Next.js dev server)
mkcert -key-file "$CERT_DIR/$DOMAIN-key.pem" -cert-file "$CERT_DIR/$DOMAIN.pem" "$DOMAIN"

# Keycloak certificate
mkcert -key-file "$CERT_DIR/$AUTH_DOMAIN-key.pem" -cert-file "$CERT_DIR/$AUTH_DOMAIN.pem" "$AUTH_DOMAIN"

echo ""
echo "✅ Certificates generated in $CERT_DIR/"
echo "   App:      $CERT_DIR/$DOMAIN.pem"
echo "   Keycloak: $CERT_DIR/$AUTH_DOMAIN.pem"
echo ""
echo "🚀 Next steps:"
echo "   1. docker compose -f env-local/docker-compose.yml up -d"
echo "   2. npm run dev"
echo "   3. Open https://$DOMAIN:3000"
echo "   4. Keycloak admin: https://$AUTH_DOMAIN:8443"
