import { useState, useCallback } from "react";
import { Form, ActionPanel, Action, Clipboard, showToast, Toast, Icon } from "@raycast/api";

export default function CurlGenerator() {
  const [url, setUrl] = useState("");
  const [method, setMethod] = useState("GET");
  const [headers, setHeaders] = useState("");
  const [body, setBody] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const generate = useCallback(() => {
    if (!url.trim()) { setError("Please enter a URL"); return; }
    setError("");

    const parts: string[] = ["curl"];

    if (method !== "GET") parts.push(`-X ${method}`);

    for (const line of headers.split("\n").filter(Boolean)) {
      const [k, v] = line.split(":").map((s) => s.trim());
      parts.push(`-H '${k}: ${v || ""}'`);
    }

    if (body.trim() && method !== "GET" && method !== "HEAD") {
      parts.push(`-d '${body.replace(/'/g, "'\\''")}'`);
    }

    parts.push(`'${url.trim()}'`);
    setOutput(parts.join(" \\\n  "));
  }, [url, method, headers, body]);

  const copy = useCallback(async () => {
    if (!output) return;
    await Clipboard.copy(output.replace(/ \\\n  /g, " "));
    showToast(Toast.Style.Success, "Copied to clipboard");
  }, [output]);

  const copyMulti = useCallback(async () => {
    if (!output) return;
    await Clipboard.copy(output);
    showToast(Toast.Style.Success, "Copied to clipboard");
  }, [output]);

  return (
    <Form
      actions={
        <ActionPanel>
          <Action title="Generate curl" icon={Icon.ArrowRight} onAction={generate} />
          {output && <Action title="Copy (one line)" icon={Icon.Clipboard} onAction={copy} />}
          {output && <Action title="Copy (multiline)" icon={Icon.Clipboard} onAction={copyMulti} />}
        </ActionPanel>
      }
    >
      <Form.TextField id="url" title="URL" placeholder="https://api.example.com/users" value={url} onChange={setUrl} />
      <Form.Dropdown id="method" title="Method" value={method} onChange={setMethod}>
        {["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD"].map((m) => (
          <Form.Dropdown.Item key={m} value={m} title={m} />
        ))}
      </Form.Dropdown>
      <Form.TextArea id="headers" title="Headers" placeholder="Content-Type: application/json\nAuthorization: Bearer token" value={headers} onChange={setHeaders} />
      <Form.TextArea id="body" title="Body" placeholder='{"key":"value"}' value={body} onChange={setBody} />
      {output && <Form.TextArea id="output" title="curl Command" value={output} onChange={() => {}} />}
      {error && <Form.Description text={`⚠️ ${error}`} />}
    </Form>
  );
}
