import { useState, useMemo } from "react";
import { Form, ActionPanel, Action, Clipboard, showToast, Toast, Icon } from "@raycast/api";

const MIME_TYPES: [string, string][] = [
  [".html", "text/html"],
  [".css", "text/css"],
  [".js", "text/javascript"],
  [".mjs", "text/javascript"],
  [".json", "application/json"],
  [".xml", "application/xml"],
  [".csv", "text/csv"],
  [".ts", "application/typescript"],
  [".tsx", "text/typescript-jsx"],
  [".jsx", "text/jsx"],
  [".txt", "text/plain"],
  [".md", "text/markdown"],
  [".yaml", "application/x-yaml"],
  [".yml", "application/x-yaml"],
  [".toml", "application/toml"],
  [".pdf", "application/pdf"],
  [".zip", "application/zip"],
  [".gz", "application/gzip"],
  [".tar", "application/x-tar"],
  [".png", "image/png"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".gif", "image/gif"],
  [".svg", "image/svg+xml"],
  [".webp", "image/webp"],
  [".ico", "image/x-icon"],
  [".bmp", "image/bmp"],
  [".mp3", "audio/mpeg"],
  [".wav", "audio/wav"],
  [".ogg", "audio/ogg"],
  [".mp4", "video/mp4"],
  [".webm", "video/webm"],
  [".avi", "video/x-msvideo"],
  [".mov", "video/quicktime"],
  [".woff", "font/woff"],
  [".woff2", "font/woff2"],
  [".ttf", "font/ttf"],
  [".otf", "font/otf"],
  [".eot", "application/vnd.ms-fontobject"],
  [".wasm", "application/wasm"],
  [".sql", "application/sql"],
  [".sh", "application/x-sh"],
  [".env", "text/plain"],
  [".log", "text/plain"],
  [".map", "application/json"],
];

export default function MimeLookup() {
  const [search, setSearch] = useState("");

  const filtered = useMemo(
    () =>
      search.trim()
        ? MIME_TYPES.filter(([ext, mime]) => ext.includes(search.toLowerCase()) || mime.includes(search.toLowerCase()))
        : MIME_TYPES,
    [search],
  );

  return (
    <Form
      actions={
        <ActionPanel>
          {filtered.length === 1 && (
            <Action
              title="Copy MIME Type"
              icon={Icon.Clipboard}
              onAction={async () => {
                await Clipboard.copy(filtered[0]![1]);
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
        placeholder="Extension or MIME type…"
        value={search}
        onChange={setSearch}
      />
      {filtered.map(([ext, mime]) => (
        <Form.Description key={ext} title={ext} text={mime} />
      ))}
    </Form>
  );
}
