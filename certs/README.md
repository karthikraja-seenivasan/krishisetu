# TLS certificate mount points

Do not commit real certificate material.

For app-level HTTPS in Docker:

- Put the Spring Boot PKCS12 keystore at `certs/api/keystore.p12`.
- Put the Next.js certificate and key at `certs/web/fullchain.pem` and `certs/web/privkey.pem`.

On EC2, prefer mounting these from a secure server path by setting:

```env
API_TLS_KEYSTORE_DIR=/opt/krishisetu/certs/api
WEB_TLS_CERT_DIR=/opt/krishisetu/certs/web
```
