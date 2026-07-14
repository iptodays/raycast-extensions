import { useState, useCallback } from "react";
import { Form, ActionPanel, Action, Clipboard, showToast, Toast, Icon } from "@raycast/api";

function hexToRgb(hex: string): number[] | null {
  const m = hex.replace(/^#/, "").match(/^([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
  if (!m) return null;
  return [parseInt(m[1]!, 16), parseInt(m[2]!, 16), parseInt(m[3]!, 16)];
}

function relativeLuminance(r: number, g: number, b: number): number {
  const lin = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

function contrastRatio(l1: number, l2: number): number {
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function wcagLevel(ratio: number, large: boolean): string {
  if (large) {
    if (ratio >= 3) return "AA";
    return "FAIL";
  }
  if (ratio >= 4.5) return "AA";
  if (ratio >= 3) return "AA Large";
  return "FAIL";
}

export default function ColorContrast() {
  const [fg, setFg] = useState("");
  const [bg, setBg] = useState("");
  const [result, setResult] = useState("");
  const [error, setError] = useState("");

  const check = useCallback(() => {
    const f = fg.trim();
    const b = bg.trim();
    if (!f || !b) {
      setError("Please enter both foreground and background colors");
      return;
    }
    const fRgb = hexToRgb(f);
    const bRgb = hexToRgb(b);
    if (!fRgb) {
      setError(`Cannot parse foreground "${f}" — use format #RRGGBB`);
      return;
    }
    if (!bRgb) {
      setError(`Cannot parse background "${b}" — use format #RRGGBB`);
      return;
    }
    setError("");

    const l1 = relativeLuminance(fRgb[0]!, fRgb[1]!, fRgb[2]!);
    const l2 = relativeLuminance(bRgb[0]!, bRgb[1]!, bRgb[2]!);
    const ratio = contrastRatio(l1, l2);

    setResult(
      [
        `Contrast Ratio: ${ratio.toFixed(2)}:1`,
        `Foreground:     #${f.toUpperCase().replace(/^#/, "")}`,
        `Background:     #${b.toUpperCase().replace(/^#/, "")}`,
        `AA Normal:      ${ratio >= 4.5 ? "✓ PASS" : "✗ FAIL"} (≥ 4.5:1)`,
        `AA Large:       ${ratio >= 3 ? "✓ PASS" : "✗ FAIL"} (≥ 3:1)`,
        `AAA Normal:     ${ratio >= 7 ? "✓ PASS" : "✗ FAIL"} (≥ 7:1)`,
      ].join("\n"),
    );
  }, [fg, bg]);

  const copy = useCallback(async () => {
    if (!result) return;
    await Clipboard.copy(result);
    showToast(Toast.Style.Success, "Copied to clipboard");
  }, [result]);

  return (
    <Form
      actions={
        <ActionPanel>
          <Action title="Check Contrast" icon={Icon.Swatch} onAction={check} />
          {result && <Action title="Copy Result" icon={Icon.Clipboard} onAction={copy} />}
        </ActionPanel>
      }
    >
      <Form.TextField id="fg" title="Foreground" placeholder="#000000" value={fg} onChange={setFg} />
      <Form.TextField id="bg" title="Background" placeholder="#FFFFFF" value={bg} onChange={setBg} />
      {result && <Form.TextArea id="output" title="Result" value={result} onChange={() => {}} />}
      {error && <Form.Description text={`⚠️ ${error}`} />}
    </Form>
  );
}
