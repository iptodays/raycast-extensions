import { useState, useCallback } from "react";
import { Form, ActionPanel, Action, Clipboard, showToast, Toast, Icon } from "@raycast/api";

function jsonToTS(json: string, name: string): string {
  const parsed = JSON.parse(json);
  return generateInterface(parsed, name, 0);
}

function generateInterface(obj: unknown, name: string, indent: number): string {
  const pad = "  ".repeat(indent);

  if (obj === null || obj === undefined) {
    return `${pad}${name}: unknown;`;
  }

  if (Array.isArray(obj)) {
    if (obj.length === 0) return `${pad}${name}: unknown[];`;
    const types = new Set(obj.map((item) => getTypeName(item)));
    const typeStr = types.size === 1 ? [...types][0]! : `(${[...types].join(" | ")})`;
    return `${pad}${name}: ${typeStr}[];`;
  }

  if (typeof obj === "object") {
    const entries = Object.entries(obj as Record<string, unknown>);
    if (entries.length === 0) return `${pad}${name}: Record<string, unknown>;`;

    const props = entries.map(([key, val]) => {
      const propName = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key) ? key : `"${key}"`;
      if (val !== null && typeof val === "object" && !Array.isArray(val)) {
        return `${pad}  ${propName}: ${generateInterface(val, "", indent + 1).trim()}`;
      }
      if (Array.isArray(val)) {
        return `${pad}  ${propName}: ${generateInterface(val, "", indent + 1).trim().replace(/^[^:]*:\s*/, "")}`;
      }
      return `${pad}  ${propName}: ${getTypeName(val)};`;
    });

    return `${pad}interface ${name} {\n${props.join("\n")}\n${pad}}`;
  }

  return `${pad}${name}: ${getTypeName(obj)};`;
}

function getTypeName(val: unknown): string {
  if (val === null) return "null";
  if (val === undefined) return "undefined";
  if (typeof val === "string") return "string";
  if (typeof val === "number") return "number";
  if (typeof val === "boolean") return "boolean";
  if (Array.isArray(val)) return "unknown[]";
  return "Record<string, unknown>";
}

export default function JsonToTypescript() {
  const [input, setInput] = useState("");
  const [name, setName] = useState("Root");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const convert = useCallback(() => {
    if (!input.trim()) {
      setError("Please enter JSON");
      return;
    }
    try {
      setError("");
      setOutput(jsonToTS(input, name.trim() || "Root"));
    } catch {
      setError("Invalid JSON — make sure it's valid");
    }
  }, [input, name]);

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
      <Form.TextField id="name" title="Interface Name" placeholder="Root" value={name} onChange={setName} />
      <Form.TextArea
        id="input"
        title="JSON"
        placeholder='{"name": "Alice", "age": 30}'
        value={input}
        onChange={setInput}
      />
      {output && <Form.TextArea id="output" title="TypeScript" value={output} onChange={() => {}} />}
      {error && <Form.Description text={`⚠️ ${error}`} />}
    </Form>
  );
}
