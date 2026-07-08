import { useState, useCallback, useMemo } from "react";
import { Form, ActionPanel, Action, Clipboard, showToast, Toast, Icon } from "@raycast/api";

const PERM_BITS: [string, number, string][] = [
  ["Owner Read", 400, "r"],
  ["Owner Write", 200, "w"],
  ["Owner Execute", 100, "x"],
  ["Group Read", 40, "r"],
  ["Group Write", 20, "w"],
  ["Group Execute", 10, "x"],
  ["Other Read", 4, "r"],
  ["Other Write", 2, "w"],
  ["Other Execute", 1, "x"],
];

function modeToSymbol(mode: number, i: number): string {
  const bits = [400, 200, 100, 40, 20, 10, 4, 2, 1];
  const chars = ["r", "w", "x", "r", "w", "x", "r", "w", "x"];
  return mode & bits[i]! ? chars[i]! : "-";
}

function formatSymbolic(mode: number): string {
  return PERM_BITS.map((_, i) => modeToSymbol(mode, i)).join("");
}

export default function ChmodCalc() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const toNumeric = useCallback(() => {
    const s = input.trim();
    if (/^\d{3}$/.test(s)) {
      const mode = parseInt(s, 8);
      setError("");
      setOutput(
        [
          `Numeric: ${s}`,
          `Symbolic: ${formatSymbolic(mode)}`,
          `Binary:  ${mode.toString(2).padStart(9, "0")}`,
        ].join("\n")
      );
    } else if (/^[rwx-]{9}$/i.test(s)) {
      let mode = 0;
      for (let i = 0; i < 9; i++) {
        if (s[i] !== "-") mode += PERM_BITS[i]![1];
      }
      setError("");
      setOutput(
        [
          `Symbolic: ${s}`,
          `Numeric: ${mode.toString(8).padStart(3, "0")}`,
          `Binary:  ${mode.toString(2).padStart(9, "0")}`,
        ].join("\n")
      );
    } else {
      setError("Enter 3-digit octal (755) or 9-char symbolic (rwxr-xr-x)");
    }
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
          <Action title="Calculate" icon={Icon.ArrowRight} onAction={toNumeric} />
          {output && <Action title="Copy Output" icon={Icon.Clipboard} onAction={copy} />}
        </ActionPanel>
      }
    >
      <Form.TextField
        id="input"
        title="Permissions"
        placeholder="755 or rwxr-xr-x"
        value={input}
        onChange={setInput}
      />
      {output && <Form.TextArea id="output" title="Result" value={output} onChange={() => {}} />}
      {error && <Form.Description text={`⚠️ ${error}`} />}
    </Form>
  );
}
