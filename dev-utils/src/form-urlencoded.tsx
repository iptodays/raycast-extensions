import { useState, useCallback } from "react";
import { Form, ActionPanel, Action, Clipboard, showToast, Toast, Icon } from "@raycast/api";

export default function FormUrlEncoded() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const parse = useCallback(() => {
    if (!input.trim()) { setError("Please enter form-urlencoded data"); return; }
    const params = new URLSearchParams(input);
    const obj: Record<string, string> = {};
    params.forEach((v, k) => { obj[k] = v; });
    setError("");
    setOutput(JSON.stringify(obj, null, 2));
  }, [input]);

  const encode = useCallback(() => {
    try {
      const obj = JSON.parse(input);
      setError("");
      setOutput(new URLSearchParams(obj).toString());
    } catch {
      setError("Invalid JSON — enter a valid JSON object");
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
            <Action title="Form → JSON" icon={Icon.ArrowRight} onAction={parse} />
            <Action title="JSON → Form" icon={Icon.ArrowLeft} onAction={encode} />
          </ActionPanel.Section>
          {output && <Action title="Copy Output" icon={Icon.Clipboard} onAction={copy} />}
        </ActionPanel>
      }
    >
      <Form.TextArea id="input" title="Input" placeholder="key1=val1&key2=val2 or JSON" value={input} onChange={setInput} />
      {output && <Form.TextArea id="output" title="Output" value={output} onChange={() => {}} />}
      {error && <Form.Description text={`⚠️ ${error}`} />}
    </Form>
  );
}
