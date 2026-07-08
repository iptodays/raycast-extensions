import { useState, useMemo } from "react";
import { Form, ActionPanel, Action, Clipboard, showToast, Toast, Icon } from "@raycast/api";

const PATTERNS: { title: string; pattern: string; description: string }[] = [
  { title: "Email", pattern: "^[\\w.-]+@[\\w.-]+\\.\\w{2,}$", description: "Basic email address validation" },
  { title: "URL", pattern: "https?://[\\w./?=&%-]+", description: "HTTP or HTTPS URL" },
  { title: "IPv4", pattern: "^(?:\\d{1,3}\\.){3}\\d{1,3}$", description: "IPv4 address (basic)" },
  { title: "IPv6", pattern: "^([0-9a-f:]+:+)+[0-9a-f]+$", description: "IPv6 address (simplified)" },
  { title: "MAC Address", pattern: "^([0-9A-Fa-f]{2}[:-]){5}[0-9A-Fa-f]{2}$", description: "MAC address (colon or hyphen)" },
  { title: "Phone (US)", pattern: "^\\+?1?\\s?\\(?\\d{3}\\)?[-.\\s]?\\d{3}[-.\\s]?\\d{4}$", description: "US phone number" },
  { title: "Phone (Intl)", pattern: "^\\+\\d{1,3}[ -]?\\d{4,14}$", description: "International phone number" },
  { title: "Postal Code (US)", pattern: "^\\d{5}(-\\d{4})?$", description: "ZIP+4 code" },
  { title: "Date (YYYY-MM-DD)", pattern: "^\\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01])$", description: "ISO date" },
  { title: "Time (HH:MM)", pattern: "^([01]\\d|2[0-3]):[0-5]\\d$", description: "24-hour time" },
  { title: "HTML Tag", pattern: "<[^>]+>", description: "Any HTML tag" },
  { title: "Image File", pattern: "\\.(png|jpg|jpeg|gif|svg|webp)$", description: "Common image extensions" },
  { title: "UUID v4", pattern: "^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$", description: "UUID version 4" },
  { title: "Credit Card", pattern: "^\\d{16}$", description: "16-digit card number" },
  { title: "Currency (USD)", pattern: "^\\$?\\d{1,3}(,\\d{3})*(\\.\\d{2})?$", description: "US dollar amount" },
  { title: "Hex Color", pattern: "^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$", description: "Hex color code" },
  { title: "IP:Port", pattern: "^\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}:\\d{1,5}$", description: "IPv4 with port" },
  { title: "Slug", pattern: "^[a-z0-9]+(-[a-z0-9]+)*$", description: "URL slug" },
  { title: "SemVer", pattern: "^\\d+\\.\\d+\\.\\d+(-[\\w.]+)?(\\+[\\w.]+)?$", description: "Semantic version" },
  { title: "Chinese Characters", pattern: "^[\\u4e00-\\u9fff]+$", description: "CJK unified ideographs" },
  { title: "Strong Password", pattern: "^(?=.*[A-Z])(?=.*[a-z])(?=.*\\d)(?=.*[!@#$%^&*]).{8,}$", description: "8+ chars, upper+lower+digit+symbol" },
  { title: "Base64", pattern: "^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$", description: "Base64 encoded string" },
  { title: "YAML Front Matter", pattern: "^---\\n[\\s\\S]*?\\n---", description: "YAML front matter block" },
  { title: "JWT Token", pattern: "^[A-Za-z0-9_-]+\\.[A-Za-z0-9_-]+\\.[A-Za-z0-9_-]+$", description: "JSON Web Token" },
  { title: "Domain Name", pattern: "^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\\.)+[a-zA-Z]{2,}$", description: "Domain name" },
];

export default function RegexPatterns() {
  const [search, setSearch] = useState("");

  const filtered = useMemo(
    () =>
      search.trim()
        ? PATTERNS.filter(
            (p) =>
              p.title.toLowerCase().includes(search.toLowerCase()) ||
              p.description.toLowerCase().includes(search.toLowerCase())
          )
        : PATTERNS,
    [search]
  );

  return (
    <Form
      actions={
        <ActionPanel>
          {filtered.length === 1 && (
            <Action
              title="Copy Pattern"
              icon={Icon.Clipboard}
              onAction={async () => {
                await Clipboard.copy(filtered[0]!.pattern);
                showToast(Toast.Style.Success, "Copied to clipboard");
              }}
            />
          )}
        </ActionPanel>
      }
    >
      <Form.TextField
        id="search"
        title="Search"
        placeholder="email, ip, date…"
        value={search}
        onChange={setSearch}
      />
      {filtered.slice(0, 100).map((p) => (
        <Form.Description key={p.title} title={p.title} text={`${p.pattern}  —  ${p.description}`} />
      ))}
      {filtered.length > 100 && <Form.Description title="" text={`… and ${filtered.length - 100} more`} />}
    </Form>
  );
}
