# App-Level HTTPS In Docker

This project can run both containers over HTTPS directly. A reverse proxy is still simpler for most EC2 deployments, but these settings support the app-level certificate setup.

## Expected Files

Spring Boot expects a PKCS12 keystore:

```text
certs/api/keystore.p12
```

Next.js expects PEM files:

```text
certs/web/fullchain.pem
certs/web/privkey.pem
```

## Create The Spring Boot Keystore

If you already have Let's Encrypt files, create the keystore on the EC2 host:

```bash
openssl pkcs12 -export \
  -in /etc/letsencrypt/live/api.yourdomain.com/fullchain.pem \
  -inkey /etc/letsencrypt/live/api.yourdomain.com/privkey.pem \
  -out /opt/krishisetu/certs/api/keystore.p12 \
  -name springboot
```

Use the password you enter as `SERVER_SSL_KEY_STORE_PASSWORD`.

## EC2 `.env` Example

```env
NEXT_PUBLIC_API_URL=/
CORS_ORIGINS=https://yourdomain.com

WEB_START_COMMAND=npm run start:https
WEB_PUBLISHED_PORT=443
PORT=3443
WEB_HEALTHCHECK_URL=https://127.0.0.1:3443/
WEB_TLS_CERT_DIR=/opt/krishisetu/certs/web
API_PROXY_TARGET=https://api:8443
API_PROXY_TLS_REJECT_UNAUTHORIZED=false

SERVER_SSL_ENABLED=true
SERVER_PORT=8443
API_PUBLISHED_PORT=8443
SERVER_SSL_KEY_STORE=/certs/api/keystore.p12
SERVER_SSL_KEY_STORE_PASSWORD=replace-with-your-keystore-password
SERVER_SSL_KEY_STORE_TYPE=PKCS12
SERVER_SSL_KEY_ALIAS=springboot
API_TLS_KEYSTORE_DIR=/opt/krishisetu/certs/api
API_HEALTHCHECK_URL=https://127.0.0.1:8443/health
```

Then rebuild and start:

```bash
docker compose up -d --build
```

## AWS Security Group

For direct app-level HTTPS, allow inbound:

```text
443  -> frontend
8443 -> backend API
22   -> SSH from your IP only
```

You can keep `8080`, `3000`, and `5432` closed to the internet.
