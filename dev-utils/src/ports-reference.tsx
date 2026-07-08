import { useState, useMemo } from "react";
import { Form, ActionPanel, Action, Clipboard, showToast, Toast, Icon } from "@raycast/api";

const PORTS: { port: number; protocol: string; name: string; description: string }[] = [
  { port: 20, protocol: "TCP", name: "FTP Data", description: "File Transfer Protocol data transfer" },
  { port: 21, protocol: "TCP", name: "FTP Control", description: "File Transfer Protocol control" },
  { port: 22, protocol: "TCP", name: "SSH", description: "Secure Shell / SCP / SFTP" },
  { port: 23, protocol: "TCP", name: "Telnet", description: "Unencrypted text communications" },
  { port: 25, protocol: "TCP", name: "SMTP", description: "Simple Mail Transfer Protocol" },
  { port: 53, protocol: "UDP/TCP", name: "DNS", description: "Domain Name System" },
  { port: 67, protocol: "UDP", name: "DHCP Server", description: "Dynamic Host Configuration Protocol (server)" },
  { port: 68, protocol: "UDP", name: "DHCP Client", description: "Dynamic Host Configuration Protocol (client)" },
  { port: 80, protocol: "TCP", name: "HTTP", description: "Hypertext Transfer Protocol" },
  { port: 110, protocol: "TCP", name: "POP3", description: "Post Office Protocol v3" },
  { port: 123, protocol: "UDP", name: "NTP", description: "Network Time Protocol" },
  { port: 137, protocol: "UDP", name: "NetBIOS", description: "NetBIOS Name Service" },
  { port: 143, protocol: "TCP", name: "IMAP", description: "Internet Message Access Protocol" },
  { port: 161, protocol: "UDP", name: "SNMP", description: "Simple Network Management Protocol" },
  { port: 194, protocol: "TCP", name: "IRC", description: "Internet Relay Chat" },
  { port: 389, protocol: "TCP", name: "LDAP", description: "Lightweight Directory Access Protocol" },
  { port: 443, protocol: "TCP", name: "HTTPS", description: "HTTP over TLS/SSL" },
  { port: 445, protocol: "TCP", name: "SMB", description: "Server Message Block / CIFS" },
  { port: 465, protocol: "TCP", name: "SMTPS", description: "SMTP over SSL" },
  { port: 514, protocol: "UDP", name: "Syslog", description: "System Logging Protocol" },
  { port: 587, protocol: "TCP", name: "SMTP Submission", description: "SMTP message submission" },
  { port: 636, protocol: "TCP", name: "LDAPS", description: "LDAP over TLS/SSL" },
  { port: 993, protocol: "TCP", name: "IMAPS", description: "IMAP over TLS/SSL" },
  { port: 995, protocol: "TCP", name: "POP3S", description: "POP3 over TLS/SSL" },
  { port: 1433, protocol: "TCP", name: "MSSQL", description: "Microsoft SQL Server" },
  { port: 1521, protocol: "TCP", name: "Oracle DB", description: "Oracle Database" },
  { port: 1701, protocol: "UDP", name: "L2TP", description: "Layer 2 Tunneling Protocol" },
  { port: 1723, protocol: "TCP", name: "PPTP", description: "Point-to-Point Tunneling Protocol" },
  { port: 2375, protocol: "TCP", name: "Docker", description: "Docker REST API (plain)" },
  { port: 2376, protocol: "TCP", name: "Docker TLS", description: "Docker REST API (TLS)" },
  { port: 3000, protocol: "TCP", name: "Dev Server", description: "Common development HTTP server" },
  { port: 3306, protocol: "TCP", name: "MySQL", description: "MySQL Database" },
  { port: 3389, protocol: "TCP", name: "RDP", description: "Remote Desktop Protocol" },
  { port: 4000, protocol: "TCP", name: "Dev Server", description: "Common development HTTP server" },
  { port: 5000, protocol: "TCP", name: "Flask Dev", description: "Flask / common dev server" },
  { port: 5432, protocol: "TCP", name: "PostgreSQL", description: "PostgreSQL Database" },
  { port: 5500, protocol: "TCP", name: "Live Server", description: "VS Code Live Server" },
  { port: 6379, protocol: "TCP", name: "Redis", description: "Redis key-value store" },
  { port: 6443, protocol: "TCP", name: "Kubernetes API", description: "Kubernetes API server (TLS)" },
  { port: 6942, protocol: "TCP", name: "Angular Dev", description: "Angular development server" },
  { port: 8000, protocol: "TCP", name: "Dev HTTP", description: "Common development HTTP server" },
  { port: 8080, protocol: "TCP", name: "HTTP Alt", description: "Alternative HTTP / proxy" },
  { port: 8443, protocol: "TCP", name: "HTTPS Alt", description: "Alternative HTTPS / Tomcat" },
  { port: 9000, protocol: "TCP", name: "Dev Server", description: "Common development server" },
  { port: 9200, protocol: "TCP", name: "Elasticsearch", description: "Elasticsearch HTTP REST API" },
  { port: 27017, protocol: "TCP", name: "MongoDB", description: "MongoDB Database" },
];

export default function PortsReference() {
  const [search, setSearch] = useState("");

  const filtered = useMemo(
    () =>
      search.trim()
        ? PORTS.filter(
            (p) =>
              String(p.port).includes(search.trim()) ||
              p.name.toLowerCase().includes(search.toLowerCase()) ||
              p.protocol.toLowerCase().includes(search.toLowerCase()) ||
              p.description.toLowerCase().includes(search.toLowerCase())
          )
        : PORTS,
    [search]
  );

  return (
    <Form>
      <Form.TextField
        id="search"
        title="Search"
        placeholder="Port, service name, or protocol…"
        value={search}
        onChange={setSearch}
      />
      <Form.Separator />
      {filtered.slice(0, 50).map((p) => (
        <Form.Description
          key={`${p.port}-${p.protocol}`}
          title={`${p.port} (${p.protocol})`}
          text={`${p.name} — ${p.description}`}
        />
      ))}
      {filtered.length > 50 && (
        <Form.Description title="" text={`… and ${filtered.length - 50} more`} />
      )}
    </Form>
  );
}
