import { useState, useCallback } from "react";
import { Form, ActionPanel, Action, Clipboard, showToast, Toast, Icon } from "@raycast/api";

interface Column {
  name: string;
  width: number;
  align: string;
}

function analyzeTable(text: string): string {
  const lines = text.split("\n").filter(Boolean);
  if (lines.length < 2) return text;

  // Parse columns from header separator line
  const sepLineIdx = lines[1]?.includes("---") ? 1 : -1;
  const headerLine = sepLineIdx === 1 ? lines[0]! : "";
  const dataLines = sepLineIdx === 1 ? lines.slice(2) : lines;

  if (!headerLine) return text;

  const headers = headerLine
    .split("|")
    .filter(Boolean)
    .map((h) => h.trim());
  const colCount = headers.length;
  if (colCount === 0) return text;

  // Determine max width per column
  const widths = headers.map((h, i) => {
    let max = h.length;
    for (const line of dataLines) {
      const cells = line.split("|").filter(Boolean);
      const val = (cells[i] || "").trim();
      if (val.length > max) max = val.length;
    }
    return Math.max(max, 3);
  });

  // Build formatted table
  const fmtRow = (row: string): string =>
    "| " +
    row
      .split("|")
      .filter(Boolean)
      .map((cell, i) => cell.trim().padEnd(widths[i]!))
      .join(" | ") +
    " |";

  const fmtSep = (): string => "|" + widths.map((w) => "-".repeat(w + 2)).join("|") + "|";

  return [fmtRow(headerLine), fmtSep(), ...dataLines.map(fmtRow)].join("\n");
}

export default function MarkdownTableTool() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const format = useCallback(() => {
    if (!input.trim()) {
      setError("Please paste a markdown table");
      return;
    }
    setError("");
    setOutput(analyzeTable(input));
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
          <Action title="Format Table" icon={Icon.ArrowRight} onAction={format} />
          {output && <Action title="Copy Output" icon={Icon.Clipboard} onAction={copy} />}
        </ActionPanel>
      }
    >
      <Form.TextArea
        id="input"
        title="Input"
        placeholder="| col1 | col2 |\n| --- | --- |\n| a | b |"
        value={input}
        onChange={setInput}
      />
      {output && <Form.TextArea id="output" title="Formatted" value={output} onChange={() => {}} />}
      {error && <Form.Description text={`⚠️ ${error}`} />}
    </Form>
  );
}
