import { useState, useCallback } from "react";
import { Form, ActionPanel, Action, Clipboard, showToast, Toast, Icon } from "@raycast/api";

function float32ToHex(value: number): string {
  const buf = new ArrayBuffer(4);
  const view = new DataView(buf);
  view.setFloat32(0, value);
  const hex = Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join(" ")
    .toUpperCase();
  const bits = Array.from(new Uint8Array(buf))
    .map((b) => b.toString(2).padStart(8, "0"))
    .join(" ");
  const sign = (view.getUint32(0) >> 31) & 1;
  const exp = (view.getUint32(0) >> 23) & 0xff;
  const mant = view.getUint32(0) & 0x7fffff;
  return [
    `Single (32-bit):`,
    `  Hex:     ${hex}`,
    `  Binary:  ${bits}`,
    `  Sign:    ${sign}`,
    `  Exp:     ${exp - 127}`,
    `  Mant:    0x${mant.toString(16).toUpperCase().padStart(6, "0")}`,
  ].join("\n");
}

function float64ToHex(value: number): string {
  const buf = new ArrayBuffer(8);
  const view = new DataView(buf);
  view.setFloat64(0, value);
  const hex = Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join(" ")
    .toUpperCase();
  const bits = Array.from(new Uint8Array(buf))
    .map((b) => b.toString(2).padStart(8, "0"))
    .join(" ");
  const sign = (view.getBigUint64(0) >> 63n) & 1n;
  const exp = (view.getBigUint64(0) >> 52n) & 0x7fffn;
  const mant = view.getBigUint64(0) & 0xfffffffffffffn;
  return [
    `Double (64-bit):`,
    `  Hex:     ${hex}`,
    `  Binary:  ${bits}`,
    `  Sign:    ${sign}`,
    `  Exp:     ${Number(exp) - 1023}`,
    `  Mant:    0x${mant.toString(16).toUpperCase().padStart(13, "0")}`,
  ].join("\n");
}

export default function Ieee754Tool() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [precision, setPrecision] = useState<"single" | "double">("double");

  const convert = useCallback(() => {
    if (!input.trim()) {
      setError("Please enter a number");
      return;
    }
    const num = parseFloat(input);
    if (isNaN(num) || !isFinite(num)) {
      setError("Enter a valid finite number");
      return;
    }
    setError("");
    const f32 = float32ToHex(num);
    const f64 = float64ToHex(num);
    setOutput(precision === "single" ? f32 : f64);
  }, [input, precision]);

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
      <Form.Dropdown id="precision" title="Precision" value={precision} onChange={(v) => setPrecision(v as "single" | "double")}>
        <Form.Dropdown.Item value="single" title="Single (32-bit)" />
        <Form.Dropdown.Item value="double" title="Double (64-bit)" />
      </Form.Dropdown>
      <Form.TextField
        id="input"
        title="Decimal"
        placeholder="3.14159"
        value={input}
        onChange={setInput}
      />
      {output && <Form.TextArea id="output" title="IEEE 754" value={output} onChange={() => {}} />}
      {error && <Form.Description text={`⚠️ ${error}`} />}
    </Form>
  );
}
