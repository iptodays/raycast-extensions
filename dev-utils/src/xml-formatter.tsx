import { useState, useCallback } from "react";
import { Form, ActionPanel, Action, Clipboard, showToast, Toast, Icon } from "@raycast/api";

function formatXML(xml: string): string {
  const trimmed = xml.trim();
  let formatted = "";
  let indent = 0;
  let inTag = false;
  let inClose = false;

  for (let i = 0; i < trimmed.length; i++) {
    const ch = trimmed[i]!;
    if (ch === "<") {
      inTag = true;
      if (trimmed[i + 1] === "/") {
        indent--;
        inClose = true;
      }
      if (formatted.length && !formatted.endsWith("\n")) {
        formatted += "\n" + "  ".repeat(Math.max(0, indent));
      } else if (formatted.length) {
        formatted += "  ".repeat(Math.max(0, indent));
      }
      formatted += ch;
    } else if (ch === ">") {
      formatted += ch;
      if (inTag && !inClose) indent++;
      inTag = false;
      inClose = false;
    } else {
      formatted += ch;
    }
  }

  return formatted.trim();
}

function minifyXML(xml: string): string {
  return xml.replace(/>\s+</g, "><").trim();
}

export default function XmlFormatter() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const format = useCallback(() => {
    if (!input.trim()) {
      setError("Please enter XML");
      return;
    }
    try {
      setError("");
      setOutput(formatXML(input));
    } catch {
      setError("Failed to format XML");
    }
  }, [input]);

  const doMinify = useCallback(() => {
    if (!input.trim()) {
      setError("Please enter XML");
      return;
    }
    setError("");
    setOutput(minifyXML(input));
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
            <Action title="Format" icon={Icon.Download} onAction={format} />
            <Action title="Minify" icon={Icon.Code} onAction={doMinify} />
          </ActionPanel.Section>
          {output && <Action title="Copy Output" icon={Icon.Clipboard} onAction={copy} />}
        </ActionPanel>
      }
    >
      <Form.TextArea
        id="input"
        title="XML Input"
        placeholder="<root><item>value</item></root>"
        value={input}
        onChange={setInput}
      />
      {output && <Form.TextArea id="output" title="Output" value={output} onChange={() => {}} />}
      {error && <Form.Description text={`⚠️ ${error}`} />}
    </Form>
  );
}
