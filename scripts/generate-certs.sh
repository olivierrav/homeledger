#!/bin/bash
# Generate local HTTPS certificates using mkcert
# Prerequisites: brew install mkcert && mkcert -install

set -e

DOMAIN="mac-perso-ora.test"
CERT_DIR="certificates"

# Create certificates directory
mkdir -p "$CERT_DIR"

# Generate certificates
mkcert -key-file "$CERT_DIR/$DOMAIN-key.pem" -cert-file "$CERT_DIR/$DOMAIN.pem" "$DOMAIN"

echo ""
echo "✅ Certificates generated in $CERT_DIR/"
echo "   - $CERT_DIR/$DOMAIN.pem"
echo "   - $CERT_DIR/$DOMAIN-key.pem"
echo ""
echo "🚀 Run 'npm run dev' to start with HTTPS on https://$DOMAIN:3000"
