import { useState, useCallback } from "react";
import { Form, ActionPanel, Action, Clipboard, showToast, Toast, Icon } from "@raycast/api";

type LineOp = "number" | "trim" | "dedup" | "remove-empty" | "remove-duplicate-lines" | "reverse" | "sort-alpha" | "shuffle";

function operate(text: string, op: LineOp): string {
  const lines = text.split("\n");

  switch (op) {
    case "number":
      return lines.map((l, i) => `${String(i + 1).padStart(String(lines.length).length)}  ${l}`).join("\n");
    case "trim":
      return lines.map((l) => l.trimEnd()).join("\n");
    case "dedup": {
      const seen = new Set<string>();
      return lines.filter((l) => {
        if (seen.has(l)) return false;
        seen.add(l);
        return true;
      }).join("\n");
    }
    case "remove-empty":
      return lines.filter((l) => l.trim()).join("\n");
    case "remove-duplicate-lines":
      return [...new Set(lines)].join("\n");
    case "reverse":
      return [...lines].reverse().join("\n");
    case "sort-alpha":
      return [...lines].sort((a, b) => a.localeCompare(b)).join("\n");
    case "shuffle": {
      const arr = [...lines];
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j]!, arr[i]!];
      }
      return arr.join("\n");
    }
  }
}

const OPS: { value: LineOp; label: string }[] = [
  { value: "number", label: "Add Line Numbers" },
  { value: "trim", label: "Trim Trailing Whitespace" },
  { value: "dedup", label: "Remove Consecutive Duplicates" },
  { value: "remove-empty", label: "Remove Empty Lines" },
  { value: "remove-duplicate-lines", label: "Remove Duplicate Lines" },
  { value: "reverse", label: "Reverse Order" },
  { value: "sort-alpha", label: "Sort Alphabetically" },
  { value: "shuffle", label: "Shuffle Randomly" },
];

export default function LineTool() {
  const [input, setInput] = useState("");
  const [op, setOp] = useState<LineOp>("number");
  const [output, setOutput] = useState("");

  const process = useCallback(() => {
    if (!input.trim()) {
      showToast(Toast.Style.Failure, "Please enter text");
      return;
    }
    setOutput(operate(input, op));
  }, [input, op]);

  const copy = useCallback(async () => {
    if (!output) return;
    await Clipboard.copy(output);
    showToast(Toast.Style.Success, "Copied to clipboard");
  }, [output]);

  return (
    <Form
      actions={
        <ActionPanel>
          <Action title="Process" icon={Icon.ArrowRight} onAction={process} />
          {output && <Action title="Copy Output" icon={Icon.Clipboard} onAction={copy} />}
        </ActionPanel>
      }
    >
      <Form.Dropdown id="op" title="Operation" value={op} onChange={(v) => setOp(v as LineOp)}>
        {OPS.map((o) => (
          <Form.Dropdown.Item key={o.value} value={o.value} title={o.label} />
        ))}
      </Form.Dropdown>
      <Form.TextArea
        id="input"
        title="Input"
        placeholder="One item per line…"
        value={input}
        onChange={setInput}
      />
      {output && <Form.TextArea id="output" title="Output" value={output} onChange={() => {}} />}
    </Form>
  );
}
