import { useState, useCallback } from "react";
import { Form, ActionPanel, Action, Clipboard, showToast, Toast, Icon } from "@raycast/api";

export default function UrlTool() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const encode = useCallback(() => {
    if (!input.trim()) {
      setError("Please enter a URL or string to encode");
      return;
    }
    try {
      setError("");
      setOutput(encodeURIComponent(input));
    } catch {
      setError("Encoding failed");
    }
  }, [input]);

  const decode = useCallback(() => {
    if (!input.trim()) {
      setError("Please enter an encoded URL string");
      return;
    }
    try {
      setError("");
      setOutput(decodeURIComponent(input));
    } catch {
      setError("Invalid URL encoding");
    }
  }, [input]);

  const parse = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed) {
      setError("Please enter a URL to parse");
      return;
    }
    try {
      const u = new URL(trimmed);
      setError("");
      const params: string[] = [];
      u.searchParams.forEach((v, k) => params.push(`  ${k}: ${v}`));

      setOutput(
        [
          `Protocol: ${u.protocol}`,
          `Hostname: ${u.hostname}`,
          `Port: ${u.port || "(default)"}`,
          `Pathname: ${u.pathname}`,
          `Hash: ${u.hash || "(none)"}`,
          params.length ? `Query params:\n${params.join("\n")}` : "Query: (none)",
        ].join("\n")
      );
    } catch {
      setError("Invalid URL");
    }
  }, [input]);

  const copy = useCallback(async () => {
    if (!output) return;
    await Clipboard.copy(output);
    showToast(Toast.Style.Success, "Copied to clipboard");
  }, [output]);

  return (
    <Form
      actions={
        <ActionPanel>
          <ActionPanel.Section title="Actions">
            <Action title="Encode" icon={Icon.Lock} onAction={encode} />
            <Action title="Decode" icon={Icon.LockUnlocked} onAction={decode} />
            <Action title="Parse URL" icon={Icon.MagnifyingGlass} onAction={parse} />
          </ActionPanel.Section>
          <ActionPanel.Section title="Copy">
            <Action title="Copy Output" icon={Icon.Clipboard} onAction={copy} />
            {error && <Action title="Copy Error" icon={Icon.Clipboard} onAction={() => Clipboard.copy(error)} />}
          </ActionPanel.Section>
        </ActionPanel>
      }
    >
      <Form.TextArea
        id="input"
        title="Input"
        placeholder="URL or string to encode/decode/parse…"
        value={input}
        onChange={setInput}
      />
      {output && <Form.TextArea id="output" title="Output" value={output} onChange={setOutput} />}
      {error && <Form.Description text={`⚠️ ${error}`} />}
    </Form>
  );
}
