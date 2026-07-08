import { useState, useCallback } from "react";
import { Form, ActionPanel, Action, Clipboard, showToast, Toast, Icon } from "@raycast/api";

function hexToRgb(hex: string): string | null {
  const m = hex.replace(/^#/, "").match(/^([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
  if (!m) return null;
  return `${parseInt(m[1]!, 16)}, ${parseInt(m[2]!, 16)}, ${parseInt(m[3]!, 16)}`;
}

function rgbToHex(r: number, g: number, b: number): string {
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1).toUpperCase()}`;
}

function rgbToHsl(r: number, g: number, b: number): string {
  const [rr, gg, bb] = [r / 255, g / 255, b / 255];
  const max = Math.max(rr, gg, bb);
  const min = Math.min(rr, gg, bb);
  const diff = max - min;
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  if (diff) {
    s = l > 0.5 ? diff / (2 - max - min) : diff / (max + min);
    if (max === rr) h = ((gg - bb) / diff + (gg < bb ? 6 : 0)) * 60;
    else if (max === gg) h = ((bb - rr) / diff + 2) * 60;
    else h = ((rr - gg) / diff + 4) * 60;
  }
  return `hsl(${Math.round(h)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
}

export default function ColorTool() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const convert = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed) {
      setError("Please enter a color value");
      return;
    }

    // HEX → RGB & HSL
    const hexResult = hexToRgb(trimmed);
    if (hexResult) {
      setError("");
      const [r, g, b] = hexResult.split(", ").map(Number);
      setOutput(`HEX: ${trimmed.toUpperCase()}\nRGB: ${hexResult}\nHSL: ${rgbToHsl(r!, g!, b!)}`);
      return;
    }

    // RGB → HEX & HSL
    const rgbMatch = trimmed.match(/^\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*$/);
    if (rgbMatch) {
      const [r, g, b] = [Number(rgbMatch[1]), Number(rgbMatch[2]), Number(rgbMatch[3])];
      if (r > 255 || g > 255 || b > 255) {
        setError("RGB values must be between 0 and 255");
        return;
      }
      setError("");
      setOutput(`HEX: ${rgbToHex(r, g, b)}\nRGB: ${r}, ${g}, ${b}\nHSL: ${rgbToHsl(r, g, b)}`);
      return;
    }

    setError(`Cannot parse "${trimmed}". Try #FF0000 or 255, 0, 0`);
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
          <ActionPanel.Section title="Actions">
            <Action title="Convert" icon={Icon.Swatch} onAction={convert} />
          </ActionPanel.Section>
          <ActionPanel.Section title="Copy">
            <Action title="Copy Output" icon={Icon.Clipboard} onAction={copy} />
            {error && <Action title="Copy Error" icon={Icon.Clipboard} onAction={() => Clipboard.copy(error)} />}
          </ActionPanel.Section>
        </ActionPanel>
      }
    >
      <Form.TextArea
        id="input"
        title="Input"
        placeholder="HEX: #FF0000 or RGB: 255, 0, 0"
        value={input}
        onChange={setInput}
      />
      {output && <Form.TextArea id="output" title="Output" value={output} onChange={setOutput} />}
      {error && <Form.Description text={`⚠️ ${error}`} />}
    </Form>
  );
}
