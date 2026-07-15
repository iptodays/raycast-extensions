import { useState, useCallback } from "react";
import { Form, ActionPanel, Action, Clipboard, showToast, Toast, Icon } from "@raycast/api";

function inferType(val: unknown): Record<string, unknown> {
  if (val === null) return { type: "null" };
  if (Array.isArray(val)) {
    if (val.length === 0) return { type: "array", items: {} as Record<string, unknown> };
    const itemTypes = [...new Set(val.map((v) => JSON.stringify(inferType(v))))];
    const items = itemTypes.length === 1 ? JSON.parse(itemTypes[0]!) : {};
    return { type: "array", items };
  }
  switch (typeof val) {
    case "string":
      return { type: "string" };
    case "number":
      return Number.isInteger(val) ? { type: "integer" } : { type: "number" };
    case "boolean":
      return { type: "boolean" };
    case "object": {
      const props: Record<string, unknown> = {};
      const required: string[] = [];
      for (const [key, value] of Object.entries(val as Record<string, unknown>)) {
        props[key] = inferType(value);
        if (value !== null && value !== undefined) required.push(key);
      }
      return {
        type: "object",
        ...(required.length ? { required } : {}),
        properties: props,
        additionalProperties: false,
      };
    }
    default:
      return { type: "string" };
  }
}

function jsonToSchema(json: string, title: string): string {
  const parsed = JSON.parse(json);
  const schema = {
    $schema: "http://json-schema.org/draft-07/schema#",
    ...(title ? { title } : {}),
    ...inferType(parsed),
  };
  return JSON.stringify(schema, null, 2);
}

export default function JsonSchemaGenerator() {
  const [input, setInput] = useState("");
  const [title, setTitle] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const generate = useCallback(() => {
    if (!input.trim()) {
      setError("Please enter JSON");
      return;
    }
    try {
      setError("");
      setOutput(jsonToSchema(input, title.trim()));
    } catch {
      setError("Invalid JSON");
    }
  }, [input, title]);

  const copy = useCallback(async () => {
    if (!output) return;
    await Clipboard.copy(output);
    showToast(Toast.Style.Success, "Copied to clipboard");
  }, [output]);

  return (
    <Form
      actions={
        <ActionPanel>
          <Action title="Generate Schema" icon={Icon.ArrowRight} onAction={generate} />
          {output && <Action title="Copy Output" icon={Icon.Clipboard} onAction={copy} />}
        </ActionPanel>
      }
    >
      <Form.TextField
        id="title"
        title="Schema Title (optional)"
        placeholder="MySchema"
        value={title}
        onChange={setTitle}
      />
      <Form.TextArea
        id="input"
        title="JSON"
        placeholder='{"name": "Alice", "age": 30}'
        value={input}
        onChange={setInput}
      />
      {output && <Form.TextArea id="output" title="JSON Schema (Draft-07)" value={output} onChange={() => {}} />}
      {error && <Form.Description text={`⚠️ ${error}`} />}
    </Form>
  );
}
