import { useState, useCallback } from "react";
import { Form, ActionPanel, Action, Clipboard, showToast, Toast, Icon } from "@raycast/api";

function parseINI(text: string): string {
  const result: Record<string, Record<string, string>> = {};
  let section = "";

  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith(";") || trimmed.startsWith("#")) continue;
    const secMatch = trimmed.match(/^\[(.+)\]$/);
    if (secMatch) {
      section = secMatch[1]!;
      result[section] = {};
      continue;
    }
    const kvMatch = trimmed.match(/^([^=]+)=(.*)$/);
    if (kvMatch && section) {
      result[section]![kvMatch[1]!.trim()] = kvMatch[2]!.trim();
    }
  }

  return JSON.stringify(result, null, 2);
}

export default function IniParser() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [direction, setDirection] = useState<"ini-json" | "json-ini">("ini-json");
  const [error, setError] = useState("");

  const convert = useCallback(() => {
    if (!input.trim()) { setError("Please enter data"); return; }

    if (direction === "ini-json") {
      try {
        setError("");
        setOutput(parseINI(input));
      } catch {
        setError("Failed to parse INI file");
      }
    } else {
      try {
        const obj = JSON.parse(input);
        setError("");
        const lines: string[] = [];
        for (const [section, kv] of Object.entries(obj)) {
          lines.push(`[${section}]`);
          for (const [k, v] of Object.entries(kv as object)) {
            lines.push(`${k} = ${v}`);
          }
          lines.push("");
        }
        setOutput(lines.join("\n"));
      } catch {
        setError("Invalid JSON");
      }
    }
  }, [input, direction]);

  const copy = useCallback(async () => {
    if (!output) return;
    await Clipboard.copy(output);
    showToast(Toast.Style.Success, "Copied to clipboard");
  }, [output]);

  return (
    <Form
      actions={
        <ActionPanel>
          <Action title="Convert" icon={Icon.ArrowRight} onAction={convert} />
          {output && <Action title="Copy Output" icon={Icon.Clipboard} onAction={copy} />}
        </ActionPanel>
      }
    >
      <Form.Dropdown id="direction" title="Direction" value={direction} onChange={(v) => setDirection(v as "ini-json" | "json-ini")}>
        <Form.Dropdown.Item value="ini-json" title="INI → JSON" />
        <Form.Dropdown.Item value="json-ini" title="JSON → INI" />
      </Form.Dropdown>
      <Form.TextArea id="input" title="Input" placeholder="[section]\nkey = value" value={input} onChange={setInput} />
      {output && <Form.TextArea id="output" title="Output" value={output} onChange={() => {}} />}
      {error && <Form.Description text={`⚠️ ${error}`} />}
    </Form>
  );
}
