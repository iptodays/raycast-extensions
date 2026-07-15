import { useState, useCallback } from "react";
import { Form, ActionPanel, Action, Clipboard, showToast, Toast, Icon } from "@raycast/api";

export default function PercentageCalc() {
  const [num, setNum] = useState("");
  const [total, setTotal] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const whatPercent = useCallback(() => {
    const n = parseFloat(num);
    const t = parseFloat(total);
    if (isNaN(n) || isNaN(t) || t === 0) {
      setError("Enter valid numbers (total != 0)");
      return;
    }
    setError("");
    setOutput(`${n} is ${((n / t) * 100).toFixed(2)}% of ${t}`);
  }, [num, total]);

  const percentOf = useCallback(() => {
    const p = parseFloat(num);
    const t = parseFloat(total);
    if (isNaN(p) || isNaN(t)) {
      setError("Enter valid numbers");
      return;
    }
    setError("");
    setOutput(`${p}% of ${t} = ${((p / 100) * t).toFixed(4)}`);
  }, [num, total]);

  const change = useCallback(() => {
    const old = parseFloat(num);
    const nw = parseFloat(total);
    if (isNaN(old) || isNaN(nw) || old === 0) {
      setError("Enter valid numbers (old != 0)");
      return;
    }
    const pct = ((nw - old) / old) * 100;
    const sign = pct >= 0 ? "+" : "";
    setError("");
    setOutput(`Change: ${sign}${pct.toFixed(2)}%`);
  }, [num, total]);

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
            <Action title="What Percent" icon={Icon.ArrowRight} onAction={whatPercent} />
            <Action title="Percent Of" icon={Icon.ArrowRight} onAction={percentOf} />
            <Action title="Percent Change" icon={Icon.ArrowRight} onAction={change} />
          </ActionPanel.Section>
          {output && <Action title="Copy Result" icon={Icon.Clipboard} onAction={copy} />}
        </ActionPanel>
      }
    >
      <Form.TextField id="num" title="Value / Percent" placeholder="15" value={num} onChange={setNum} />
      <Form.TextField id="total" title="Total / Old / New" placeholder="200" value={total} onChange={setTotal} />
      {output && <Form.TextField id="output" title="Result" value={output} onChange={() => {}} />}
      {error && <Form.Description text={`⚠️ ${error}`} />}
    </Form>
  );
}
