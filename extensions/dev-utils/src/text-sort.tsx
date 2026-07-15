import { useState, useCallback } from "react";
import { Form, ActionPanel, Action, Clipboard, showToast, Toast, Icon } from "@raycast/api";

type SortMode = "alpha" | "reverse" | "length" | "unique" | "shuffle" | "natural";

function sortLines(text: string, mode: SortMode): string {
  const lines = text.split("\n");

  switch (mode) {
    case "alpha":
      return [...lines].sort((a, b) => a.localeCompare(b)).join("\n");
    case "reverse":
      return [...lines].reverse().join("\n");
    case "length":
      return [...lines].sort((a, b) => a.length - b.length).join("\n");
    case "unique": {
      const seen = new Set<string>();
      return lines
        .filter((l) => {
          if (seen.has(l)) return false;
          seen.add(l);
          return true;
        })
        .join("\n");
    }
    case "shuffle": {
      const arr = [...lines];
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j]!, arr[i]!];
      }
      return arr.join("\n");
    }
    case "natural":
      return [...lines]
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }))
        .join("\n");
  }
}

const MODES: { value: SortMode; label: string }[] = [
  { value: "alpha", label: "Alphabetical (A→Z)" },
  { value: "reverse", label: "Reverse" },
  { value: "length", label: "By Length (short→long)" },
  { value: "unique", label: "Unique (deduplicate)" },
  { value: "shuffle", label: "Shuffle (random)" },
  { value: "natural", label: "Natural Sort (2 before 10)" },
];

export default function TextSort() {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<SortMode>("alpha");
  const [output, setOutput] = useState("");

  const sort = useCallback(() => {
    if (!input.trim()) {
      showToast(Toast.Style.Failure, "Please enter text");
      return;
    }
    setOutput(sortLines(input, mode));
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
          <Action title="Sort" icon={Icon.ArrowRight} onAction={sort} />
          {output && <Action title="Copy Output" icon={Icon.Clipboard} onAction={copy} />}
        </ActionPanel>
      }
    >
      <Form.Dropdown id="mode" title="Sort Mode" value={mode} onChange={(v) => setMode(v as SortMode)}>
        {MODES.map((m) => (
          <Form.Dropdown.Item key={m.value} value={m.value} title={m.label} />
        ))}
      </Form.Dropdown>
      <Form.TextArea id="input" title="Input" placeholder="One item per line…" value={input} onChange={setInput} />
      {output && <Form.TextArea id="output" title="Sorted" value={output} onChange={() => {}} />}
    </Form>
  );
}
