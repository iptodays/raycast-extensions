import { useState, useCallback } from "react";
import { Form, ActionPanel, Action, Clipboard, showToast, Toast, Icon } from "@raycast/api";

const NGINX_DIRECTIVES: { directive: string; context: string; description: string; example: string }[] = [
  {
    directive: "server",
    context: "http",
    description: "Define a virtual server block",
    example: "server { listen 80; server_name example.com; }",
  },
  {
    directive: "listen",
    context: "server",
    description: "Set IP and port to listen on",
    example: "listen 443 ssl http2;",
  },
  {
    directive: "server_name",
    context: "server",
    description: "Virtual host name(s)",
    example: "server_name example.com www.example.com;",
  },
  {
    directive: "root",
    context: "http/server/location",
    description: "Document root path",
    example: "root /var/www/html;",
  },
  {
    directive: "index",
    context: "http/server/location",
    description: "Default index file",
    example: "index index.html index.php;",
  },
  {
    directive: "location",
    context: "server",
    description: "Match request URI patterns",
    example: "location /api/ { proxy_pass http://backend; }",
  },
  {
    directive: "proxy_pass",
    context: "location",
    description: "Forward request to upstream",
    example: "proxy_pass http://127.0.0.1:3000;",
  },
  {
    directive: "proxy_set_header",
    context: "http/server/location",
    description: "Set header forwarded to upstream",
    example: "proxy_set_header X-Real-IP $remote_addr;",
  },
  {
    directive: "add_header",
    context: "http/server/location",
    description: "Add response header",
    example: "add_header X-Frame-Options DENY;",
  },
  {
    directive: "return",
    context: "server/location",
    description: "Return status/redirect",
    example: "return 301 https://example.com$request_uri;",
  },
  {
    directive: "rewrite",
    context: "server/location",
    description: "Rewrite request URI",
    example: "rewrite ^/old/(.*)$ /new/$1 permanent;",
  },
  {
    directive: "try_files",
    context: "server/location",
    description: "Try files in order, fallback",
    example: "try_files $uri $uri/ /index.html;",
  },
  {
    directive: "error_page",
    context: "http/server/location",
    description: "Custom error page",
    example: "error_page 404 /404.html;",
  },
  {
    directive: "access_log",
    context: "http/server/location",
    description: "Access log path and format",
    example: "access_log /var/log/nginx/access.log combined;",
  },
  {
    directive: "error_log",
    context: "http/server/location",
    description: "Error log path and level",
    example: "error_log /var/log/nginx/error.log warn;",
  },
  {
    directive: "ssl_certificate",
    context: "server",
    description: "SSL certificate path",
    example: "ssl_certificate /etc/ssl/cert.pem;",
  },
  {
    directive: "ssl_certificate_key",
    context: "server",
    description: "SSL private key path",
    example: "ssl_certificate_key /etc/ssl/key.pem;",
  },
  { directive: "gzip", context: "http/server/location", description: "Enable gzip compression", example: "gzip on;" },
  {
    directive: "gzip_types",
    context: "http/server/location",
    description: "MIME types to compress",
    example: "gzip_types text/css application/javascript;",
  },
  {
    directive: "client_max_body_size",
    context: "http/server/location",
    description: "Max request body size",
    example: "client_max_body_size 10m;",
  },
  {
    directive: "keepalive_timeout",
    context: "http/server/location",
    description: "Keep-alive timeout",
    example: "keepalive_timeout 65;",
  },
  {
    directive: "worker_processes",
    context: "main",
    description: "Number of worker processes",
    example: "worker_processes auto;",
  },
  {
    directive: "worker_connections",
    context: "events",
    description: "Max connections per worker",
    example: "worker_connections 1024;",
  },
  {
    directive: "upstream",
    context: "http",
    description: "Define backend server group",
    example: "upstream backend { server 127.0.0.1:3000; server 127.0.0.1:3001; }",
  },
  {
    directive: "limit_req_zone",
    context: "http",
    description: "Rate limiting zone",
    example: "limit_req_zone $binary_remote_addr zone=one:10m rate=10r/s;",
  },
  {
    directive: "limit_req",
    context: "http/server/location",
    description: "Apply rate limit",
    example: "limit_req zone=one burst=20 nodelay;",
  },
  {
    directive: "map",
    context: "http",
    description: "Map variable to value",
    example: "map $http_upgrade $connection_upgrade { default upgrade; '' close; }",
  },
  {
    directive: "include",
    context: "any",
    description: "Include config file",
    example: "include /etc/nginx/mime.types;",
  },
];

export default function NginxReference() {
  const [search, setSearch] = useState("");

  const filtered = search.trim()
    ? NGINX_DIRECTIVES.filter(
        (d) =>
          d.directive.toLowerCase().includes(search.toLowerCase()) ||
          d.context.toLowerCase().includes(search.toLowerCase()) ||
          d.description.toLowerCase().includes(search.toLowerCase()),
      )
    : NGINX_DIRECTIVES;

  return (
    <Form>
      <Form.TextField
        id="search"
        title="Search"
        placeholder="proxy_pass, ssl, upstream…"
        value={search}
        onChange={setSearch}
      />
      {filtered.map((d) => (
        <Form.Description
          key={d.directive}
          title={`${d.directive}  (context: ${d.context})`}
          text={`${d.description}  —  e.g. ${d.example}`}
        />
      ))}
    </Form>
  );
}
