const { createServer } = require("https");
const http = require("http");
const https = require("https");
const { parse } = require("url");
const fs = require("fs");
const next = require("next");

const hostname = process.env.HTTPS_HOST || "0.0.0.0";
const port = Number(process.env.HTTPS_PORT || process.env.PORT || 3443);
const keyPath = process.env.HTTPS_KEY_PATH || "/certs/privkey.pem";
const certPath = process.env.HTTPS_CERT_PATH || "/certs/fullchain.pem";
const caPath = process.env.HTTPS_CA_PATH;
const apiProxyTarget = process.env.API_PROXY_TARGET;
const rejectUnauthorized = process.env.API_PROXY_TLS_REJECT_UNAUTHORIZED !== "false";

const app = next({ dev: false, hostname, port });
const handle = app.getRequestHandler();
const proxyAgent = apiProxyTarget?.startsWith("https:")
  ? new https.Agent({ rejectUnauthorized })
  : undefined;

const httpsOptions = {
  key: fs.readFileSync(keyPath),
  cert: fs.readFileSync(certPath),
};

if (caPath) {
  httpsOptions.ca = fs.readFileSync(caPath);
}

app.prepare().then(() => {
  createServer(httpsOptions, (req, res) => {
    if (apiProxyTarget && req.url?.startsWith("/api/")) {
      proxyApiRequest(req, res);
      return;
    }

    handle(req, res, parse(req.url, true));
  }).listen(port, hostname, () => {
    console.log(`Next.js HTTPS server ready on https://${hostname}:${port}`);
  });
});

function proxyApiRequest(req, res) {
  const target = new URL(req.url, apiProxyTarget);
  const client = target.protocol === "https:" ? https : http;
  const headers = { ...req.headers, host: target.host };

  const proxyReq = client.request(
    target,
    {
      method: req.method,
      headers,
      agent: proxyAgent,
    },
    (proxyRes) => {
      res.writeHead(proxyRes.statusCode || 502, proxyRes.headers);
      proxyRes.pipe(res);
    }
  );

  proxyReq.on("error", (error) => {
    console.error(`API proxy error: ${error.message}`);
    res.writeHead(502, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Unable to reach the API service." }));
  });

  req.pipe(proxyReq);
}
