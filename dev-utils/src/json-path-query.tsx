import { useState, useCallback } from "react";
import { Form, ActionPanel, Action, Clipboard, showToast, Toast, Icon } from "@raycast/api";

function get(obj: unknown, path: string): unknown {
  const parts = path.split(/[.[\]]+/).filter(Boolean);
  let cur = obj;
  for (const p of parts) {
    if (cur === null || typeof cur !== "object") return undefined;
    if (Array.isArray(cur)) {
      const idx = parseInt(p, 10);
      if (isNaN(idx)) return undefined;
      cur = cur[idx];
    } else {
      cur = (cur as Record<string, unknown>)[p];
    }
  }
  return cur;
}

export default function JsonPathQuery() {
  const [json, setJson] = useState("");
  const [path, setPath] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const query = useCallback(() => {
    if (!json.trim() || !path.trim()) { setError("Please enter JSON and a path"); return; }
    try {
      const obj = JSON.parse(json);
      const result = get(obj, path);
      setError("");
      setOutput(JSON.stringify(result, null, 2));
    } catch (e) {
      setError("Invalid JSON: " + (e as Error).message);
    }
  }, [json, path]);

  const copy = useCallback(async () => {
    if (!output) return;
    await Clipboard.copy(output);
    showToast(Toast.Style.Success, "Copied to clipboard");
  }, [output]);

  return (
    <Form
      actions={
        <ActionPanel>
          <Action title="Query" icon={Icon.MagnifyingGlass} onAction={query} />
          {output && <Action title="Copy Result" icon={Icon.Clipboard} onAction={copy} />}
        </ActionPanel>
      }
    >
      <Form.TextArea id="json" title="JSON" placeholder='{"users":[{"name":"Alice"}]}' value={json} onChange={setJson} />
      <Form.TextField id="path" title="Path (dot notation)" placeholder="users.0.name" value={path} onChange={setPath} />
      {output && <Form.TextArea id="output" title="Result" value={output} onChange={() => {}} />}
      {error && <Form.Description text={`⚠️ ${error}`} />}
    </Form>
  );
}
