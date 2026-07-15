import { useState, useCallback } from "react";
import { Form, ActionPanel, Action, Clipboard, showToast, Toast, Icon } from "@raycast/api";

function readFileAsBase64(file: string, callback: (base64: string) => void) {
  // This is a placeholder — Raycast has limited file API
  // We'll use a textarea approach for pasted data
}

export default function ImageToBase64() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [prefix, setPrefix] = useState(true);
  const [error, setError] = useState("");

  const convertToImage = useCallback(() => {
    if (!input.trim()) {
      setError("Please paste an image URL or file path");
      return;
    }
    const stripped = input.trim().replace(/^data:image\/[^;]+;base64,/, "");
    try {
      atob(stripped);
      setError("");
      setOutput(prefix ? `data:image/png;base64,${stripped}` : stripped);
    } catch {
      setError("Invalid Base64 encoded image data");
    }
  }, [input, prefix]);

  const encodeFromUrl = useCallback(async () => {
    if (!input.trim()) {
      setError("Please enter text to encode as Base64");
      return;
    }
    try {
      setError("");
      const encoded = btoa(input);
      setOutput(encoded);
    } catch {
      setError("Encoding failed — text may contain non-Latin1 characters");
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
            <Action title="Text → Base64" icon={Icon.Lock} onAction={encodeFromUrl} />
            <Action
              title="Strip Data-URI Prefix"
              icon={Icon.Code}
              onAction={() => {
                const s = input.trim().replace(/^data:image\/[^;]+;base64,/, "");
                setOutput(s);
                showToast(Toast.Style.Success, "Prefix stripped");
              }}
            />
          </ActionPanel.Section>
          {output && <Action title="Copy Output" icon={Icon.Clipboard} onAction={copy} />}
        </ActionPanel>
      }
    >
      <Form.Checkbox id="prefix" label="Include data:image/...;base64, prefix" value={prefix} onChange={setPrefix} />
      <Form.TextArea
        id="input"
        title="Text or Base64 Image Data"
        placeholder="Enter text to encode, or paste Base64 image data…"
        value={input}
        onChange={setInput}
      />
      {output && <Form.TextArea id="output" title="Output" value={output} onChange={() => {}} />}
      {error && <Form.Description text={`⚠️ ${error}`} />}
    </Form>
  );
}
