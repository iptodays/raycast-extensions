import { useState, useCallback } from "react";
import { Form, ActionPanel, Action, Clipboard, showToast, Toast, Icon } from "@raycast/api";

function deepKeys(obj: unknown, prefix = ""): string[] {
  if (obj === null || typeof obj !== "object") return [prefix || JSON.stringify(obj)];
  if (Array.isArray(obj)) {
    return obj.flatMap((v, i) => deepKeys(v, prefix ? `${prefix}[${i}]` : `[${i}]`));
  }
  return Object.entries(obj as Record<string, unknown>).flatMap(([k, v]) => deepKeys(v, prefix ? `${prefix}.${k}` : k));
}

function flatten(obj: unknown): Record<string, string> {
  const result: Record<string, string> = {};
  for (const k of deepKeys(obj)) {
    const v = get(obj, k);
    if (typeof v !== "object" || v === null) result[k] = String(v);
  }
  return result;
}

function get(obj: unknown, path: string): unknown {
  const parts = path.split(/[.[\]]+/).filter(Boolean);
  let cur = obj;
  for (const p of parts) {
    if (cur === null || typeof cur !== "object") return undefined;
    if (Array.isArray(cur)) cur = cur[parseInt(p, 10)];
    else cur = (cur as Record<string, unknown>)[p];
  }
  return cur;
}

function diffJSON(a: unknown, b: unknown, path = ""): string[] {
  const diffs: string[] = [];
  if (typeof a !== typeof b || (a === null) !== (b === null)) {
    diffs.push(`${path || "root"}: ${JSON.stringify(a)} → ${JSON.stringify(b)} (type change)`);
    return diffs;
  }
  if (a === null || typeof a !== "object") {
    if (a !== b) diffs.push(`${path || "root"}: ${JSON.stringify(a)} → ${JSON.stringify(b)}`);
    return diffs;
  }
  const allKeys = [...new Set([...Object.keys(a as object), ...Object.keys(b as object)])];
  for (const k of allKeys) {
    const va = (a as Record<string, unknown>)[k];
    const vb = (b as Record<string, unknown>)[k];
    if (va === undefined) diffs.push(`${path}.${k}: + ADDED → ${JSON.stringify(vb)}`);
    else if (vb === undefined) diffs.push(`${path}.${k}: - REMOVED (was ${JSON.stringify(va)})`);
    else diffs.push(...diffJSON(va, vb, `${path}.${k}`));
  }
  return diffs;
}

export default function JsonDiff() {
  const [left, setLeft] = useState("");
  const [right, setRight] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const compare = useCallback(() => {
    try {
      const a = JSON.parse(left);
      const b = JSON.parse(right);
      const diffs = diffJSON(a, b, "");
      setError("");
      setOutput(diffs.length ? diffs.join("\n") : "No differences found.");
    } catch (e) {
      setError("Invalid JSON: " + (e as Error).message);
    }
  }, [left, right]);

  const copy = useCallback(async () => {
    if (!output) return;
    await Clipboard.copy(output);
    showToast(Toast.Style.Success, "Copied to clipboard");
  }, [output]);

  return (
    <Form
      actions={
        <ActionPanel>
          <Action title="Compare" icon={Icon.ArrowRight} onAction={compare} />
          {output && <Action title="Copy Diff" icon={Icon.Clipboard} onAction={copy} />}
        </ActionPanel>
      }
    >
      <Form.TextArea id="left" title="JSON A" placeholder='{"a":1,"b":2}' value={left} onChange={setLeft} />
      <Form.TextArea id="right" title="JSON B" placeholder='{"a":1,"b":3}' value={right} onChange={setRight} />
      {output && <Form.TextArea id="output" title="Diff" value={output} onChange={() => {}} />}
      {error && <Form.Description text={`⚠️ ${error}`} />}
    </Form>
  );
}
