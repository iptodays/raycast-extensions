import { useState, useCallback } from "react";
import { Form, ActionPanel, Action, Clipboard, showToast, Toast, Icon } from "@raycast/api";

export default function SqlInsertGen() {
  const [table, setTable] = useState("users");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const generate = useCallback(() => {
    if (!input.trim()) { setError("Please enter data (JSON array or CSV)"); return; }

    let rows: Record<string, string>[] = [];
    try {
      rows = JSON.parse(input);
      if (!Array.isArray(rows)) throw new Error("Not array");
    } catch {
      // Try CSV
      const lines = input.split("\n").filter(Boolean);
      if (lines.length < 2) { setError("Need at least a header row and data"); return; }
      const headers = lines[0]!.split(",").map((h) => h.trim());
      rows = lines.slice(1).map((l) => {
        const vals = l.split(",");
        const obj: Record<string, string> = {};
        headers.forEach((h, i) => { obj[h] = (vals[i] || "").trim(); });
        return obj;
      });
    }

    if (rows.length === 0) { setError("No data rows found"); return; }

    const columns = Object.keys(rows[0]!);
    const values = rows.map((r) =>
      `(${columns.map((c) => `'${(r[c] || "").replace(/'/g, "''")}'`).join(", ")})`
    );

    setError("");
    setOutput(`INSERT INTO ${table} (${columns.join(", ")})\nVALUES\n  ${values.join(",\n  ")};\n`);
  }, [input, table]);

  const copy = useCallback(async () => {
    if (!output) return;
    await Clipboard.copy(output);
    showToast(Toast.Style.Success, "Copied to clipboard");
  }, [output]);

  return (
    <Form
      actions={
        <ActionPanel>
          <Action title="Generate INSERT" icon={Icon.ArrowRight} onAction={generate} />
          {output && <Action title="Copy SQL" icon={Icon.Clipboard} onAction={copy} />}
        </ActionPanel>
      }
    >
      <Form.TextField id="table" title="Table Name" placeholder="users" value={table} onChange={setTable} />
      <Form.TextArea id="input" title="Data (JSON | CSV)" placeholder='[{"name":"Alice","age":"30"}]' value={input} onChange={setInput} />
      {output && <Form.TextArea id="output" title="SQL" value={output} onChange={() => {}} />}
      {error && <Form.Description text={`⚠️ ${error}`} />}
    </Form>
  );
}
