import { useState, useCallback } from "react";
import { Form, ActionPanel, Action, Clipboard, showToast, Toast, Icon } from "@raycast/api";

function encodeEntities(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function decodeEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, "/");
}

export default function HtmlEntityTool() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const encode = useCallback(() => {
    if (!input.trim()) {
      setError("Please enter text to encode");
      return;
    }
    setError("");
    setOutput(encodeEntities(input));
  }, [input]);

  const decode = useCallback(() => {
    if (!input.trim()) {
      setError("Please enter HTML entities to decode");
      return;
    }
    setError("");
    setOutput(decodeEntities(input));
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
            <Action title="Encode" icon={Icon.Lock} onAction={encode} />
            <Action title="Decode" icon={Icon.LockUnlocked} onAction={decode} />
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
        placeholder="Text or HTML entities…"
        value={input}
        onChange={setInput}
      />
      {output && <Form.TextArea id="output" title="Output" value={output} onChange={setOutput} />}
      {error && <Form.Description text={`⚠️ ${error}`} />}
    </Form>
  );
}
