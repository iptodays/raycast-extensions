import { useState, useCallback } from "react";
import { Form, ActionPanel, Action, Clipboard, showToast, Toast, Icon } from "@raycast/api";

function parseTSV(text: string): { headers: string[]; rows: string[][] } {
  const lines = text.split("\n").filter(Boolean);
  if (lines.length === 0) return { headers: [], rows: [] };
  const headers = lines[0]!.split("\t").map((h) => h.trim());
  const rows = lines.slice(1).map((line) => line.split("\t").map((c) => c.trim()));
  return { headers, rows };
}

function tsvToCsv(tsv: string): string {
  const { headers, rows } = parseTSV(tsv);
  const esc = (s: string) => (s.includes(",") || s.includes('"') ? `"${s.replace(/"/g, '""')}"` : s);
  const lines = [headers.map(esc).join(","), ...rows.map((r) => r.map(esc).join(","))];
  return lines.join("\n");
}

function tsvToJson(tsv: string): string {
  const { headers, rows } = parseTSV(tsv);
  const data = rows.map((r) => {
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => { obj[h] = r[i] || ""; });
    return obj;
  });
  return JSON.stringify(data, null, 2);
}

export default function TsvConverter() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<"csv" | "json">("csv");
  const [error, setError] = useState("");

  const convert = useCallback(() => {
    if (!input.trim()) {
      setError("Please enter TSV data");
      return;
    }
    const { headers } = parseTSV(input);
    if (headers.length === 0) {
      setError("No TSV data found");
      return;
    }
    setError("");
    setOutput(mode === "csv" ? tsvToCsv(input) : tsvToJson(input));
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
          <Action title="Convert" icon={Icon.ArrowRight} onAction={convert} />
          {output && <Action title="Copy Output" icon={Icon.Clipboard} onAction={copy} />}
        </ActionPanel>
      }
    >
      <Form.Dropdown id="mode" title="Output Format" value={mode} onChange={(v) => setMode(v as "csv" | "json")}>
        <Form.Dropdown.Item value="csv" title="TSV → CSV" />
        <Form.Dropdown.Item value="json" title="TSV → JSON" />
      </Form.Dropdown>
      <Form.TextArea
        id="input"
        title="TSV Data"
        placeholder={"name\tage\tcity\nAlice\t30\tNYC\nBob\t25\tLA"}
        value={input}
        onChange={setInput}
      />
      {output && <Form.TextArea id="output" title="Output" value={output} onChange={() => {}} />}
      {error && <Form.Description text={`⚠️ ${error}`} />}
    </Form>
  );
}
