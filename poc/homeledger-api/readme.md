# Home Ledger

## Installation

**Docker avec la BDD**

Créer un container pour une bdd

```
docker run --name homeledger-db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=homeledger \
  -p 5432:5432 \
  -d postgres:16
  ```

Démarrer le container
```
docker exec -it postgres-local psql -U postgres -d emaildb
```

**Docker keycloak**
```
docker network create keycloak-net
```

```
docker run --name keycloak \
  --network keycloak-net \
  -p 8080:8080 \
  -e KEYCLOAK_ADMIN=admin \
  -e KEYCLOAK_ADMIN_PASSWORD=admin \
  -e KC_PROXY=edge \
  -e KC_HOSTNAME=https://auth.mac-perso-ora \
  quay.io/keycloak/keycloak:latest \
  start-dev
  ```

**Configuration d'un reverse proxu https pour les dev

```
sudo sh -c 'echo "127.0.0.1 mac-perso-ora.test auth.mac-perso-ora.test api.mac-perso-ora.test" >> /etc/hosts'
```

Installer Caddy
```
brew install caddy
```

Editer /opt/homebrew/etc/Caddyfile :

```
{
  # Forcer l'utilisation du CA local (HTTPS local sans Let's Encrypt)
  local_certs
}

auth.mac-perso-ora.test {
  reverse_proxy http://localhost:8080 {
    header_up X-Forwarded-Proto {scheme}
    header_up X-Forwarded-Host {host}
    header_up X-Forwarded-For {remote}
  }
}

api.mac-perso-ora.test {
  reverse_proxy http://localhost:3000
}
```

Démarrage du service Caddy

```
sudo brew services start caddy
sudo caddy trust
```