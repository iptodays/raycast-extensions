import { useState, useCallback } from "react";
import { Form, ActionPanel, Action, Clipboard, showToast, Toast, Icon } from "@raycast/api";

// Embed a minimal YAML parser to avoid external dependencies
function yamlToJson(yaml: string): string {
  const lines = yaml.split("\n");
  const result: Record<string, unknown> = {};
  const stack: { indent: number; obj: Record<string, unknown> }[] = [{ indent: -1, obj: result }];

  for (const raw of lines) {
    const trimmed = raw.trimEnd();
    if (!trimmed.trim() || trimmed.trim().startsWith("#")) continue;

    const indent = trimmed.search(/\S|$/);
    const content = trimmed.trim();

    // pop stack to correct level
    while (stack.length > 1 && stack[stack.length - 1]!.indent >= indent) {
      stack.pop();
    }

    const current = stack[stack.length - 1]!.obj;

    if (content.includes(":")) {
      const colonIdx = content.indexOf(":");
      const key = content.slice(0, colonIdx).trim();
      let value: unknown = content.slice(colonIdx + 1).trim();

      if (value === "" || value === "null") {
        value = null;
      } else if (value === "true") {
        value = true;
      } else if (value === "false") {
        value = false;
      } else if (/^\d+$/.test(value as string)) {
        value = parseInt(value as string, 10);
      } else if (/^\d+\.\d+$/.test(value as string)) {
        value = parseFloat(value as string);
      } else if ((value as string).startsWith("'") && (value as string).endsWith("'")) {
        value = (value as string).slice(1, -1);
      } else if ((value as string).startsWith('"') && (value as string).endsWith('"')) {
        value = (value as string).slice(1, -1);
      }

      current[key] = value;

      if (content.endsWith(":") || /:\s*$/.test(content)) {
        const newObj: Record<string, unknown> = {};
        current[key] = newObj;
        stack.push({ indent, obj: newObj });
      }
    }
  }

  return JSON.stringify(result, null, 2);
}

function jsonToYaml(obj: unknown, indent = 0): string {
  if (obj === null || obj === undefined) return "null";
  if (typeof obj === "string") return obj.includes("\n") ? `"${obj}"` : obj;
  if (typeof obj === "number" || typeof obj === "boolean") return String(obj);
  if (Array.isArray(obj)) {
    if (obj.length === 0) return "[]";
    return obj.map((item) => `${"  ".repeat(indent)}- ${jsonToYaml(item, indent + 1).trimStart()}`).join("\n");
  }
  if (typeof obj === "object") {
    const keys = Object.keys(obj as Record<string, unknown>);
    if (keys.length === 0) return "{}";
    return keys
      .map((k) => {
        const val = (obj as Record<string, unknown>)[k];
        if (val && typeof val === "object" && !Array.isArray(val)) {
          return `${"  ".repeat(indent)}${k}:\n${jsonToYaml(val, indent + 1)}`;
        }
        return `${"  ".repeat(indent)}${k}: ${jsonToYaml(val, indent)}`;
      })
      .join("\n");
  }
  return String(obj);
}

function detectAndConvert(input: string): { output: string; mode: "json" | "yaml"; error?: string } {
  const trimmed = input.trim();
  if (!trimmed) return { output: "", mode: "json", error: "Please enter input" };

  // Try JSON first -> convert to YAML
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    try {
      const parsed = JSON.parse(trimmed);
      return { output: jsonToYaml(parsed, 0), mode: "yaml" };
    } catch {
      return { output: "", mode: "json", error: "Invalid JSON" };
    }
  }

  // Try YAML -> convert to JSON
  try {
    const json = yamlToJson(trimmed);
    JSON.parse(json); // validate
    return { output: json, mode: "json" };
  } catch {
    return { output: "", mode: "yaml", error: "Cannot parse as YAML or JSON" };
  }
}

export default function YamlJsonTool() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<"json" | "yaml">("json");
  const [error, setError] = useState("");

  const convert = useCallback(() => {
    const result = detectAndConvert(input);
    setOutput(result.output);
    setMode(result.mode);
    setError(result.error || "");
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
          <Action title="Convert" icon={Icon.ArrowRight} onAction={convert} />
          {output && <Action title="Copy Output" icon={Icon.Clipboard} onAction={copy} />}
          {error && <Action title="Copy Error" icon={Icon.Clipboard} onAction={() => Clipboard.copy(error)} />}
        </ActionPanel>
      }
    >
      <Form.TextArea
        id="input"
        title="Input"
        placeholder="Enter JSON or YAML…"
        value={input}
        onChange={setInput}
      />
      {output && (
        <Form.TextArea
          id="output"
          title={`Output (${mode.toUpperCase()})`}
          value={output}
          onChange={setOutput}
          info="Use Copy Output to copy to clipboard"
        />
      )}
      {error && <Form.Description text={`⚠️ ${error}`} />}
    </Form>
  );
}
