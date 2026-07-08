import { useState, useCallback } from "react";
import { Form, ActionPanel, Action, showToast, Toast, Icon } from "@raycast/api";

function decimalToBase(num: number, base: number): string {
  if (num === 0) return "0";
  const digits = "0123456789ABCDEF";
  let result = "";
  let n = num;
  while (n > 0) {
    result = digits[n % base]! + result;
    n = Math.floor(n / base);
  }
  return result;
}

function baseToDecimal(str: string, base: number): number {
  const digits = "0123456789ABCDEF";
  let result = 0;
  for (const c of str.toUpperCase()) {
    result = result * base + digits.indexOf(c);
  }
  return result;
}

interface BaseResult {
  label: string;
  base: number;
  value: string;
}

function convertAll(input: string): { results: BaseResult[]; error?: string } {
  const trimmed = input.trim();
  if (!trimmed) {
    return { results: [], error: "Please enter a value" };
  }

  // Detect input base
  let decimal: number;
  if (/^0x/i.test(trimmed)) {
    decimal = parseInt(trimmed, 16);
  } else if (/^0[bB]/.test(trimmed)) {
    decimal = parseInt(trimmed.slice(2), 2);
  } else if (/^0[oO]/.test(trimmed)) {
    decimal = parseInt(trimmed.slice(2), 8);
  } else {
    decimal = parseInt(trimmed, 10);
  }

  if (isNaN(decimal) || decimal < 0) {
    return { results: [], error: `Cannot parse "${trimmed}" as a positive number` };
  }

  return {
    results: [
      { label: "Decimal (10)", base: 10, value: decimal.toString() },
      { label: "Hexadecimal (16)", base: 16, value: decimalToBase(decimal, 16) },
      { label: "Octal (8)", base: 8, value: decimalToBase(decimal, 8) },
      { label: "Binary (2)", base: 2, value: decimalToBase(decimal, 2) },
    ],
  };
}

export default function NumberBaseTool() {
  const [input, setInput] = useState("");
  const [results, setResults] = useState<BaseResult[]>([]);
  const [error, setError] = useState("");

  const convert = useCallback(() => {
    const { results: res, error: err } = convertAll(input);
    setResults(res);
    setError(err || "");
  }, [input]);

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
        title="Input"
        placeholder="255, 0xFF, 0b11111111, 0o377…"
        value={input}
        onChange={setInput}
      />
      {results.map((r) => (
        <Form.TextField
          key={r.label}
          id={r.label}
          title={r.label}
          value={r.value}
          onChange={() => {}}
        />
      ))}
      {error && <Form.Description text={`⚠️ ${error}`} />}
    </Form>
  );
}
