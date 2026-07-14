import { useState, useCallback } from "react";
import { Form, ActionPanel, Action, Clipboard, showToast, Toast, Icon } from "@raycast/api";

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

function decimalToFraction(decimal: number): string {
  if (Number.isInteger(decimal)) return `${decimal}/1`;
  const precision = 1000000;
  const num = Math.round(decimal * precision);
  const den = precision;
  const g = gcd(Math.abs(num), den);
  const n = num / g;
  const d = den / g;
  const whole = Math.floor(n / d);
  const rem = n % d;
  if (rem === 0) return `${whole}/1`;
  if (whole === 0) return `${n}/${d}`;
  return `${whole} ${Math.abs(rem)}/${d}`;
}

function fractionToDecimal(fraction: string): string {
  const parts = fraction.trim().split(/[/\s]+/);
  if (parts.length === 2) {
    const [n, d] = parts.map(Number);
    if (d === 0) return "Error: division by zero";
    return String(n / d);
  }
  if (parts.length === 3) {
    const [whole, n, d] = parts.map(Number);
    if (d === 0) return "Error: division by zero";
    return String(whole + n / d);
  }
  return "Invalid format — use 3/4 or 1 1/2";
}

export default function FractionDecimal() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [direction, setDirection] = useState<"frac-dec" | "dec-frac">("frac-dec");
  const [error, setError] = useState("");

  const convert = useCallback(() => {
    if (!input.trim()) {
      setError("Please enter a value");
      return;
    }
    setError("");
    if (direction === "frac-dec") {
      setOutput(fractionToDecimal(input));
    } else {
      const num = parseFloat(input);
      if (isNaN(num)) {
        setError("Invalid number");
        return;
      }
      setOutput(decimalToFraction(num));
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
          {output && <Action title="Copy Result" icon={Icon.Clipboard} onAction={copy} />}
        </ActionPanel>
      }
    >
      <Form.Dropdown
        id="direction"
        title="Direction"
        value={direction}
        onChange={(v) => setDirection(v as "frac-dec" | "dec-frac")}
      >
        <Form.Dropdown.Item value="frac-dec" title="Fraction → Decimal" />
        <Form.Dropdown.Item value="dec-frac" title="Decimal → Fraction" />
      </Form.Dropdown>
      <Form.TextField
        id="input"
        title="Input"
        placeholder={direction === "frac-dec" ? "3/4 or 1 1/2" : "0.75"}
        value={input}
        onChange={setInput}
      />
      {output && <Form.TextField id="output" title="Result" value={output} onChange={() => {}} />}
      {error && <Form.Description text={`⚠️ ${error}`} />}
    </Form>
  );
}
