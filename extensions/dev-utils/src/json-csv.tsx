import { useState, useCallback } from "react";
import { Form, ActionPanel, Action, Clipboard, showToast, Toast, Icon } from "@raycast/api";

function jsonToCsv(json: string): string {
  const data = JSON.parse(json);
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error("JSON must be a non-empty array of objects");
  }

  const keys = [...new Set(data.flatMap(Object.keys))];
  const esc = (s: unknown) => {
    const str = String(s ?? "");
    return str.includes(",") || str.includes('"') || str.includes("\n") ? `"${str.replace(/"/g, '""')}"` : str;
  };

  return [keys.join(","), ...data.map((row) => keys.map((k) => esc(row[k])).join(","))].join("\n");
}

function csvToJson(csv: string): string {
  const lines = csv.split("\n").filter(Boolean);
  if (lines.length < 2) throw new Error("CSV must have a header row and at least one data row");

  const headers = lines[0]!.split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
  const data = lines.slice(1).map((line) => {
    const vals: string[] = [];
    let current = "";
    let inQuotes = false;
    for (const ch of line) {
      if (ch === '"') inQuotes = !inQuotes;
      else if (ch === "," && !inQuotes) {
        vals.push(current);
        current = "";
      } else current += ch;
    }
    vals.push(current);

    const obj: Record<string, string> = {};
    headers.forEach((h, i) => {
      obj[h] = (vals[i] || "").replace(/^"|"$/g, "");
    });
    return obj;
  });

  return JSON.stringify(data, null, 2);
}

export default function JsonCsvTool() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [direction, setDirection] = useState<"json-csv" | "csv-json">("json-csv");

  const convert = useCallback(() => {
    if (!input.trim()) {
      setError("Please enter data");
      return;
    }
    try {
      setError("");
      const result = direction === "json-csv" ? jsonToCsv(input) : csvToJson(input);
      setOutput(result);
    } catch (e) {
      setError(`Conversion failed: ${(e as Error).message}`);
    }
  }, [input, direction]);

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
        </ActionPanel>
      }
    >
      <Form.Dropdown
        id="direction"
        title="Direction"
        value={direction}
        onChange={(v) => setDirection(v as "json-csv" | "csv-json")}
      >
        <Form.Dropdown.Item value="json-csv" title="JSON → CSV" />
        <Form.Dropdown.Item value="csv-json" title="CSV → JSON" />
      </Form.Dropdown>
      <Form.TextArea
        id="input"
        title="Input"
        placeholder={direction === "json-csv" ? '[{"name":"Alice","age":30}]' : "name,age\nAlice,30"}
        value={input}
        onChange={setInput}
      />
      {output && <Form.TextArea id="output" title="Output" value={output} onChange={() => {}} />}
      {error && <Form.Description text={`⚠️ ${error}`} />}
    </Form>
  );
}
