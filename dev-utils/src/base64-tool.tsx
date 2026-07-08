import { useState, useCallback } from "react";
import { Form, ActionPanel, Action, Clipboard, showToast, Toast, Icon } from "@raycast/api";

export default function Base64Tool() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const encode = useCallback(() => {
    if (!input.trim()) {
      setError("Please enter text to encode");
      return;
    }
    try {
      setError("");
      setOutput(btoa(input));
    } catch {
      setError("Encoding failed — input may contain non-Latin1 characters");
    }
  }, [input]);

  const decode = useCallback(() => {
    if (!input.trim()) {
      setError("Please enter Base64 to decode");
      return;
    }
    try {
      setError("");
      setOutput(atob(input));
    } catch {
      setError("Invalid Base64 string");
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
          <ActionPanel.Section title="Actions">
            <Action title="Encode → Base64" icon={Icon.Lock} onAction={encode} />
            <Action title="Decode ← Base64" icon={Icon.LockUnlocked} onAction={decode} />
          </ActionPanel.Section>
          <ActionPanel.Section title="Copy">
            <Action title="Copy Output" icon={Icon.Clipboard} onAction={copy} />
            {error && <Action title="Copy Error" icon={Icon.Clipboard} onAction={() => Clipboard.copy(error)} />}
          </ActionPanel.Section>
        </ActionPanel>
      }
    >
      <Form.TextArea id="input" title="Input" placeholder="Text or Base64 string…" value={input} onChange={setInput} />
      {output && (
        <Form.TextArea
          id="output"
          title="Output"
          value={output}
          onChange={setOutput}
          info="Use Copy Output to copy to clipboard"
        />
      )}
      {error && <Form.Description text={`⚠️ ${error}`} />}
    </Form>
  );
}
