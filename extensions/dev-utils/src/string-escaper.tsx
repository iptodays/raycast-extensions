import { useState, useCallback } from "react";
import { Form, ActionPanel, Action, Clipboard, showToast, Toast, Icon } from "@raycast/api";

type EscapeMode = "json" | "regex" | "cstring";

const MODE_LABEL: Record<EscapeMode, string> = {
  json: "JSON",
  regex: "Regex",
  cstring: "C String",
};

function escapeText(text: string, mode: EscapeMode): string {
  switch (mode) {
    case "json":
      return JSON.stringify(text);
    case "regex":
      return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    case "cstring":
      return text
        .replace(/\\/g, "\\\\")
        .replace(/"/g, '\\"')
        .replace(/\n/g, "\\n")
        .replace(/\r/g, "\\r")
        .replace(/\t/g, "\\t")
        .replace(/\0/g, "\\0");
  }
}

function unescapeText(text: string, mode: EscapeMode): string {
  switch (mode) {
    case "json":
      try {
        return JSON.parse(text);
      } catch {
        return "⚠️ Invalid escaped string";
      }
    case "regex":
      return text;
    case "cstring":
      return text
        .replace(/\\n/g, "\n")
        .replace(/\\r/g, "\r")
        .replace(/\\t/g, "\t")
        .replace(/\\0/g, "\0")
        .replace(/\\"/g, '"')
        .replace(/\\\\/g, "\\");
  }
}

export default function StringEscaper() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<EscapeMode>("json");
  const [error, setError] = useState("");

  const escape = useCallback(() => {
    if (!input.trim()) {
      setError("Please enter text");
      return;
    }
    setError("");
    setOutput(escapeText(input, mode));
  }, [input, mode]);

  const unescape = useCallback(() => {
    if (!input.trim()) {
      setError("Please enter text");
      return;
    }
    setError("");
    setOutput(unescapeText(input, mode));
  }, [input, mode]);

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
            <Action title="Escape" icon={Icon.Lock} onAction={escape} />
            <Action title="Unescape" icon={Icon.LockUnlocked} onAction={unescape} />
          </ActionPanel.Section>
          <ActionPanel.Section title="Copy">
            <Action title="Copy Output" icon={Icon.Clipboard} onAction={copy} />
          </ActionPanel.Section>
        </ActionPanel>
      }
    >
      <Form.Dropdown id="mode" title="Mode" value={mode} onChange={(v) => setMode(v as EscapeMode)}>
        {Object.entries(MODE_LABEL).map(([k, v]) => (
          <Form.Dropdown.Item key={k} value={k} title={v} />
        ))}
      </Form.Dropdown>
      <Form.TextArea
        id="input"
        title="Input"
        placeholder="Text to escape or unescape…"
        value={input}
        onChange={setInput}
      />
      {output && <Form.TextArea id="output" title="Output" value={output} onChange={() => {}} />}
      {error && <Form.Description text={`⚠️ ${error}`} />}
    </Form>
  );
}
