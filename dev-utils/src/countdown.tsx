import { useState, useCallback } from "react";
import { Form, ActionPanel, Action, Clipboard, showToast, Toast, Icon } from "@raycast/api";

export default function Countdown() {
  const [target, setTarget] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const calculate = useCallback(() => {
    if (!target.trim()) { setError("Please enter a target date/time"); return; }
    const d = new Date(target);
    if (isNaN(d.getTime())) { setError("Invalid date — try ISO format: 2025-12-25 or 2025-12-25T09:00:00"); return; }
    setError("");

    const diff = d.getTime() - Date.now();
    const abs = Math.abs(diff);
    const sign = diff < 0 ? " (PAST)" : "";
    const days = Math.floor(abs / 86400000);
    const hours = Math.floor((abs % 86400000) / 3600000);
    const minutes = Math.floor((abs % 3600000) / 60000);
    const seconds = Math.floor((abs % 60000) / 1000);

    setOutput(`Target: ${d.toLocaleString()}\n\n${sign}\n${days} days\n${hours} hours\n${minutes} minutes\n${seconds} seconds\n\n= ${((abs / 86400000) * 7).toFixed(1)} weeks\n= ${((abs / 86400000) * 30.44).toFixed(1)} months`);
  }, [target]);

  const copy = useCallback(async () => {
    if (!output) return;
    await Clipboard.copy(output);
    showToast(Toast.Style.Success, "Copied to clipboard");
  }, [output]);

  return (
    <Form
      actions={
        <ActionPanel>
          <Action title="Calculate" icon={Icon.Clock} onAction={calculate} />
          {output && <Action title="Copy Result" icon={Icon.Clipboard} onAction={copy} />}
        </ActionPanel>
      }
    >
      <Form.TextField id="target" title="Target Date" placeholder="2025-12-25" value={target} onChange={setTarget} />
      {output && <Form.TextArea id="output" title="Countdown" value={output} onChange={() => {}} />}
      {error && <Form.Description text={`⚠️ ${error}`} />}
    </Form>
  );
}
