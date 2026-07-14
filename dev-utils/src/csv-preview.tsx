import { useState, useCallback } from "react";
import { Form, ActionPanel, Action, Clipboard, showToast, Toast, Icon } from "@raycast/api";

interface CsvRow {
  cells: string[];
}

function parseCsv(text: string): { headers: string[]; rows: CsvRow[] } {
  const lines = text.split("\n").filter(Boolean);
  if (lines.length === 0) return { headers: [], rows: [] };

  const headers = lines[0]!.split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
  const rows = lines.slice(1).map((line) => ({
    cells: line.split(",").map((c) => c.trim().replace(/^"|"$/g, "")),
  }));

  return { headers, rows };
}

export default function CsvPreview() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const preview = useCallback(() => {
    if (!input.trim()) {
      setError("Please enter CSV data");
      return;
    }
    const { headers, rows } = parseCsv(input);
    if (headers.length === 0) {
      setError("No CSV data found");
      return;
    }
    setError("");

    // Determine column widths
    const widths = headers.map((h, i) => {
      let w = h.length;
      for (const row of rows) {
        const val = row.cells[i] ?? "";
        if (val.length > w) w = val.length;
      }
      return w;
    });

    const sep = "+" + widths.map((w) => "-".repeat(w + 2)).join("+") + "+";

    const fmtRow = (cells: string[]) => "| " + cells.map((c, i) => (c ?? "").padEnd(widths[i]!)).join(" | ") + " |";

    const lines = [
      sep,
      fmtRow(headers),
      sep,
      ...rows.map((r) => fmtRow(r.cells)),
      sep,
      "",
      `${rows.length} row${rows.length !== 1 ? "s" : ""}, ${headers.length} column${headers.length !== 1 ? "s" : ""}`,
    ];

    setOutput(lines.join("\n"));
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
          <Action title="Preview CSV" icon={Icon.ArrowRight} onAction={preview} />
          {output && <Action title="Copy Output" icon={Icon.Clipboard} onAction={copy} />}
        </ActionPanel>
      }
    >
      <Form.TextArea
        id="input"
        title="CSV Data"
        placeholder={"name,age,city\nAlice,30,NYC\nBob,25,LA"}
        value={input}
        onChange={setInput}
      />
      {output && <Form.TextArea id="output" title="Preview" value={output} onChange={() => {}} />}
      {error && <Form.Description text={`⚠️ ${error}`} />}
    </Form>
  );
}
