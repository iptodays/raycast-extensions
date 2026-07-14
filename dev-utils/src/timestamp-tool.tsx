import { useState, useCallback } from "react";
import { Form, ActionPanel, Action, Clipboard, showToast, Toast, Icon } from "@raycast/api";

export default function TimestampTool() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const toDate = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed) {
      setError("Please enter a timestamp");
      return;
    }
    const ms = /^\d{13}$/.test(trimmed) ? Number(trimmed) : Number(trimmed) * 1000;
    if (isNaN(ms)) {
      setError("Invalid number");
      return;
    }
    setError("");
    setOutput(new Date(ms).toLocaleString());
  }, [input]);

  const toTimestamp = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed) {
      setError("Please enter a date string");
      return;
    }
    const d = new Date(trimmed);
    if (isNaN(d.getTime())) {
      setError(`Cannot parse "${trimmed}" as a date`);
      return;
    }
    setError("");
    setOutput(`Unix (s): ${Math.floor(d.getTime() / 1000)}\nUnix (ms): ${d.getTime()}`);
  }, [input]);

  const now = useCallback(() => {
    setInput("");
    setError("");
    setOutput(
      `Unix (s): ${Math.floor(Date.now() / 1000)}\nUnix (ms): ${Date.now()}\nLocal: ${new Date().toLocaleString()}\nUTC: ${new Date().toUTCString()}`,
    );
  }, []);

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
            <Action title="Timestamp → Date" icon={Icon.ArrowRight} onAction={toDate} />
            <Action title="Date → Timestamp" icon={Icon.ArrowLeft} onAction={toTimestamp} />
            <Action title="Now" icon={Icon.Clock} onAction={now} />
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
        placeholder="Unix timestamp (seconds or ms) or date string…"
        value={input}
        onChange={setInput}
      />
      {output && <Form.TextArea id="output" title="Output" value={output} onChange={setOutput} />}
      {error && <Form.Description text={`⚠️ ${error}`} />}
    </Form>
  );
}
