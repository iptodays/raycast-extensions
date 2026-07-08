import { useState, useCallback } from "react";
import { Form, ActionPanel, Action, Clipboard, showToast, Toast, Icon } from "@raycast/api";

export default function ScientificNotation() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [direction, setDirection] = useState<"to-sci" | "from-sci">("to-sci");
  const [error, setError] = useState("");

  const convert = useCallback(() => {
    if (!input.trim()) { setError("Please enter a value"); return; }

    if (direction === "to-sci") {
      const num = parseFloat(input);
      if (isNaN(num)) { setError("Invalid number"); return; }
      setError("");
      setOutput(num.toExponential(6).replace(/\.?0+e/, "e").replace(/e\+/, "e"));
    } else {
      const m = input.trim().match(/^([\d.-]+)(?:[eE]\s*([+-]?\d+))?$/);
      if (!m) { setError("Invalid scientific notation"); return; }
      setError("");
      const val = m[2] ? parseFloat(`${m[1]}e${m[2]}`) : parseFloat(m[1]!);
      setOutput(Number(val).toPrecision(10).replace(/\.?0+$/, "").replace(/e.+$/, ""));
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
          {output && <Action title="Copy Output" icon={Icon.Clipboard} onAction={copy} />}
        </ActionPanel>
      }
    >
      <Form.Dropdown id="direction" title="Direction" value={direction} onChange={(v) => setDirection(v as "to-sci" | "from-sci")}>
        <Form.Dropdown.Item value="to-sci" title="Standard → Scientific" />
        <Form.Dropdown.Item value="from-sci" title="Scientific → Standard" />
      </Form.Dropdown>
      <Form.TextField id="input" title="Value" placeholder="1234567 or 1.234e6" value={input} onChange={setInput} />
      {output && <Form.TextField id="output" title="Result" value={output} onChange={() => {}} />}
      {error && <Form.Description text={`⚠️ ${error}`} />}
    </Form>
  );
}
