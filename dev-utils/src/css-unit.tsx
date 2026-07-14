import { useState, useCallback } from "react";
import { Form, ActionPanel, Action, Clipboard, showToast, Toast, Icon } from "@raycast/api";

interface UnitRow {
  label: string;
  value: string;
}

function convert(px: number, basePx: number): UnitRow[] {
  return [
    { label: "Pixels (px)", value: `${px} px` },
    { label: "Rem", value: `${(px / basePx).toFixed(4)} rem` },
    { label: "Em", value: `${((px / basePx) * 16).toFixed(4)} em` },
    { label: "Points (pt)", value: `${(px * 0.75).toFixed(2)} pt` },
    { label: "Percent (of 16px base)", value: `${((px / basePx) * 100).toFixed(2)}%` },
  ];
}

function parsePx(input: string): number | null {
  const m = input.match(/^([\d.]+)\s*(px|rem|em|pt|%)?$/i);
  if (!m) return null;
  let val = parseFloat(m[1]!);
  const unit = (m[2] || "px").toLowerCase();
  if (isNaN(val) || val < 0) return null;
  if (unit === "rem") val *= 16;
  else if (unit === "em") val *= 16;
  else if (unit === "pt") val /= 0.75;
  else if (unit === "%") val = (val / 100) * 16;
  return Math.round(val * 100) / 100;
}

export default function CssUnitTool() {
  const [input, setInput] = useState("");
  const [base, setBase] = useState("16");
  const [results, setResults] = useState<UnitRow[]>([]);
  const [error, setError] = useState("");

  const convertAll = useCallback(() => {
    const basePx = parseInt(base, 10) || 16;
    const px = parsePx(input);
    if (px === null) {
      setError("Cannot parse value — try e.g. 16px, 2rem, 12pt");
      setResults([]);
      return;
    }
    setError("");
    setResults(convert(px, basePx));
  }, [input, base]);

  const copy = useCallback(async (text: string) => {
    await Clipboard.copy(text);
    showToast(Toast.Style.Success, "Copied to clipboard");
  }, []);

  return (
    <Form
      actions={
        <ActionPanel>
          <Action title="Convert" icon={Icon.ArrowRight} onAction={convertAll} />
        </ActionPanel>
      }
    >
      <Form.TextField id="input" title="Value" placeholder="16px, 2rem, 12pt, 50%…" value={input} onChange={setInput} />
      <Form.TextField id="base" title="Base Font Size (px)" placeholder="16" value={base} onChange={setBase} />
      {results.length > 0 &&
        results.map((r) => (
          <Form.TextField key={r.label} id={r.label} title={r.label} value={r.value} onChange={() => {}} />
        ))}
      {error && <Form.Description text={`⚠️ ${error}`} />}
    </Form>
  );
}
