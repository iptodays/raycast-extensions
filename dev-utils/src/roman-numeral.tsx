import { useState, useCallback } from "react";
import { Form, ActionPanel, Action, Clipboard, showToast, Toast, Icon } from "@raycast/api";

const ROMAN_MAP: [number, string][] = [
  [1000, "M"], [900, "CM"], [500, "D"], [400, "CD"],
  [100, "C"], [90, "XC"], [50, "L"], [40, "XL"],
  [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"],
];

function toRoman(num: number): string {
  if (num < 1 || num > 3999) return "";
  let result = "";
  let n = num;
  for (const [val, sym] of ROMAN_MAP) {
    while (n >= val) {
      result += sym;
      n -= val;
    }
  }
  return result;
}

function fromRoman(roman: string): number {
  const values: Record<string, number> = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
  let total = 0;
  let prev = 0;
  for (let i = roman.length - 1; i >= 0; i--) {
    const cur = values[roman[i]!] ?? 0;
    if (cur < prev) total -= cur;
    else { total += cur; prev = cur; }
  }
  return total;
}

export default function RomanNumeralTool() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const toRomanAction = useCallback(() => {
    const num = parseInt(input.trim(), 10);
    if (isNaN(num) || num < 1 || num > 3999) {
      setError("Enter a number between 1 and 3999");
      return;
    }
    setError("");
    setOutput(`${input} = ${toRoman(num)}`);
  }, [input]);

  const fromRomanAction = useCallback(() => {
    if (!/^[IVXLCDM]+$/i.test(input.trim())) {
      setError("Enter a valid Roman numeral (I, V, X, L, C, D, M)");
      return;
    }
    const num = fromRoman(input.trim().toUpperCase());
    setError("");
    setOutput(`${input.toUpperCase()} = ${num}`);
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
            <Action title="→ Roman Numeral" icon={Icon.ArrowRight} onAction={toRomanAction} />
            <Action title="← From Roman Numeral" icon={Icon.ArrowLeft} onAction={fromRomanAction} />
          </ActionPanel.Section>
          {output && <Action title="Copy Result" icon={Icon.Clipboard} onAction={copy} />}
        </ActionPanel>
      }
    >
      <Form.TextField
        id="input"
        title="Input"
        placeholder="42 or XLII"
        value={input}
        onChange={setInput}
      />
      {output && <Form.TextField id="output" title="Result" value={output} onChange={() => {}} />}
      {error && <Form.Description text={`⚠️ ${error}`} />}
    </Form>
  );
}
