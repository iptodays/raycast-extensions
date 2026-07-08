import { useState, useCallback } from "react";
import { Form, ActionPanel, Action, Clipboard, showToast, Toast, Icon } from "@raycast/api";

const UNITS = ["B", "KB", "MB", "GB", "TB", "PB"] as const;

function formatSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), UNITS.length - 1);
  return `${(bytes / 1024 ** i).toFixed(2)} ${UNITS[i]}`;
}

function parseBytes(input: string): number | null {
  const m = input.trim().match(/^([\d.]+)\s*(B|KB|MB|GB|TB|PB)$/i);
  if (!m) return null;
  const val = parseFloat(m[1]!);
  const unit = m[2]!.toUpperCase();
  if (isNaN(val) || val < 0) return null;
  const idx = UNITS.indexOf(unit as typeof UNITS[number]);
  return idx === -1 ? null : val * 1024 ** idx;
}

interface UnitResult {
  unit: string;
  value: string;
}

export default function DataSizeConverter() {
  const [input, setInput] = useState("");
  const [results, setResults] = useState<UnitResult[]>([]);
  const [error, setError] = useState("");

  const convert = useCallback(() => {
    if (!input.trim()) {
      setError("Please enter a value");
      return;
    }
    const bytes = parseBytes(input);
    if (bytes === null) {
      setError("Cannot parse — try e.g. 1MB, 512KB, 2.5GB");
      setResults([]);
      return;
    }
    setError("");
    setResults(UNITS.map((unit) => ({ unit, value: `${(bytes / 1024 ** UNITS.indexOf(unit)).toFixed(4)} ${unit}` })));
  }, [input]);

  const copy = useCallback(async (text: string) => {
    await Clipboard.copy(text);
    showToast(Toast.Style.Success, "Copied to clipboard");
  }, []);

  return (
    <Form
      actions={
        <ActionPanel>
          <Action title="Convert" icon={Icon.ArrowRight} onAction={convert} />
        </ActionPanel>
      }
    >
      <Form.TextField
        id="input"
        title="Data Size"
        placeholder="1MB, 512KB, 2.5GB"
        value={input}
        onChange={setInput}
      />
      {results.length > 0 && (
        <>
          <Form.Description text={`Raw: ${results[0]!.value.split(" ")[0]} B`} />
          {results.map((r) => (
            <Form.TextField key={r.unit} id={r.unit} title={r.unit} value={r.value} onChange={() => {}} />
          ))}
        </>
      )}
      {error && <Form.Description text={`⚠️ ${error}`} />}
    </Form>
  );
}
