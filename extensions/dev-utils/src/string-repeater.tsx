import { useState, useCallback } from "react";
import { Form, ActionPanel, Action, Clipboard, showToast, Toast, Icon } from "@raycast/api";

export default function StringRepeater() {
  const [text, setText] = useState("");
  const [count, setCount] = useState("3");
  const [separator, setSeparator] = useState("\n");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const repeat = useCallback(() => {
    if (!text.trim()) {
      setError("Please enter text");
      return;
    }
    const n = parseInt(count, 10);
    if (isNaN(n) || n < 1 || n > 1000) {
      setError("Count must be between 1 and 1000");
      return;
    }
    setError("");
    setOutput(Array.from({ length: n }, () => text).join(separator));
  }, [text, count, separator]);

  const join = useCallback(() => {
    if (!text.trim()) {
      setError("Please enter lines");
      return;
    }
    setError("");
    setOutput(text.split("\n").join(separator));
  }, [text, separator]);

  const pad = useCallback(() => {
    if (!text.trim()) {
      setError("Please enter text");
      return;
    }
    const n = parseInt(count, 10) || 10;
    setError("");
    setOutput(`'${text.padStart(n, " ")}'\n'${text.padEnd(n, " ")}'`);
  }, [text, count]);

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
            <Action title="Repeat" icon={Icon.ArrowRight} onAction={repeat} />
            <Action title="Join Lines" icon={Icon.ArrowRight} onAction={join} />
            <Action title="Pad" icon={Icon.ArrowRight} onAction={pad} />
          </ActionPanel.Section>
          {output && <Action title="Copy Output" icon={Icon.Clipboard} onAction={copy} />}
        </ActionPanel>
      }
    >
      <Form.TextArea id="text" title="Text" placeholder="Hello" value={text} onChange={setText} />
      <Form.TextField id="count" title="Count / Width" placeholder="3" value={count} onChange={setCount} />
      <Form.TextField id="separator" title="Separator" placeholder="\\n" value={separator} onChange={setSeparator} />
      {output && <Form.TextArea id="output" title="Output" value={output} onChange={() => {}} />}
      {error && <Form.Description text={`⚠️ ${error}`} />}
    </Form>
  );
}
