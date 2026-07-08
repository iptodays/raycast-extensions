import { useState, useCallback } from "react";
import { Form, ActionPanel, Action, Clipboard, showToast, Toast, Icon } from "@raycast/api";

interface FreqItem {
  item: string;
  count: number;
  percent: string;
  bar: string;
}

function analyze(text: string, mode: "char" | "word"): FreqItem[] {
  const target = mode === "char" ? [...text.replace(/\s/g, "")] : text.split(/\s+/).filter(Boolean);
  if (target.length === 0) return [];

  const freq: Record<string, number> = {};
  for (const t of target) freq[t] = (freq[t] || 0) + 1;

  const total = target.length;
  const maxWidth = 30;
  const maxCount = Math.max(...Object.values(freq));

  return Object.entries(freq)
    .map(([item, count]) => ({
      item,
      count,
      percent: ((count / total) * 100).toFixed(1),
      bar: "█".repeat(Math.round((count / maxCount) * maxWidth)),
    }))
    .sort((a, b) => b.count - a.count);
}

export default function FrequencyAnalyzer() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<"char" | "word">("word");
  const [limit, setLimit] = useState("30");

  const analyzeText = useCallback(() => {
    if (!input.trim()) {
      showToast(Toast.Style.Failure, "Please enter text");
      return;
    }
    const results = analyze(input, mode);
    const max = Math.max(1, parseInt(limit, 10) || 30);
    const lines = results.slice(0, max).map(
      (r, i) => `${String(i + 1).padStart(3)}. ${String(r.count).padStart(5)}  (${r.percent}%)  ${r.bar}  ${r.item.length > 20 ? r.item.slice(0, 20) + "…" : r.item}`
    );
    lines.unshift(`Total ${mode}s: ${results.reduce((s, r) => s + r.count, 0)} | Unique: ${results.length}`);
    lines.unshift("");
    setOutput(lines.join("\n"));
  }, [input, mode, limit]);

  const copy = useCallback(async () => {
    if (!output) return;
    await Clipboard.copy(output);
    showToast(Toast.Style.Success, "Copied to clipboard");
  }, [output]);

  return (
    <Form
      actions={
        <ActionPanel>
          <Action title="Analyze" icon={Icon.ArrowRight} onAction={analyzeText} />
          {output && <Action title="Copy Output" icon={Icon.Clipboard} onAction={copy} />}
        </ActionPanel>
      }
    >
      <Form.Dropdown id="mode" title="Mode" value={mode} onChange={(v) => setMode(v as "char" | "word")}>
        <Form.Dropdown.Item value="word" title="Words" />
        <Form.Dropdown.Item value="char" title="Characters" />
      </Form.Dropdown>
      <Form.TextField id="limit" title="Max Results" placeholder="30" value={limit} onChange={setLimit} />
      <Form.TextArea
        id="input"
        title="Text"
        placeholder="Paste text to analyze…"
        value={input}
        onChange={setInput}
      />
      {output && <Form.TextArea id="output" title="Frequency Distribution" value={output} onChange={() => {}} />}
    </Form>
  );
}
