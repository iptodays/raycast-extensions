import { useState, useCallback } from "react";
import { Form, ActionPanel, Action, Clipboard, showToast, Toast, Icon } from "@raycast/api";

type JsonAction = "format" | "minify" | "escape" | "unescape" | "validate";

const FORMAT_TITLE: Record<JsonAction, string> = {
  format: "Formatted",
  minify: "Minified",
  escape: "Escaped",
  unescape: "Unescaped",
  validate: "Validation",
};

export default function JsonTool() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const process = useCallback(
    (action: JsonAction) => {
      const trimmed = input.trim();
      if (!trimmed) {
        setError("Please enter a JSON string");
        setOutput("");
        return;
      }

      try {
        setError("");
        switch (action) {
          case "format": {
            const parsed = JSON.parse(trimmed);
            setOutput(JSON.stringify(parsed, null, 2));
            break;
          }
          case "minify": {
            const parsed = JSON.parse(trimmed);
            setOutput(JSON.stringify(parsed));
            break;
          }
          case "validate": {
            JSON.parse(trimmed);
            setOutput("✓ Valid JSON");
            break;
          }
          case "escape": {
            setOutput(JSON.stringify(trimmed));
            break;
          }
          case "unescape": {
            setOutput(JSON.parse(trimmed));
            break;
          }
        }
      } catch (e) {
        setError(`Invalid JSON: ${(e as Error).message}`);
        setOutput("");
      }
    },
    [input],
  );

  const copy = useCallback(async () => {
    if (!output) return;
    await Clipboard.copy(output);
    showToast(Toast.Style.Success, "Copied to clipboard");
  }, [output]);

  const copyError = useCallback(async () => {
    if (!error) return;
    await Clipboard.copy(error);
    showToast(Toast.Style.Success, "Error copied to clipboard");
  }, [error]);

  return (
    <Form
      actions={
        <ActionPanel>
          <ActionPanel.Section title="Actions">
            <Action title="Format" icon={Icon.Download} onAction={() => process("format")} />
            <Action title="Minify" icon={Icon.Download} onAction={() => process("minify")} />
            <Action title="Validate" icon={Icon.CheckCircle} onAction={() => process("validate")} />
            <Action title="Escape" icon={Icon.Code} onAction={() => process("escape")} />
            <Action title="Unescape" icon={Icon.Code} onAction={() => process("unescape")} />
          </ActionPanel.Section>
          <ActionPanel.Section title="Copy">
            <Action title="Copy Output" icon={Icon.Clipboard} onAction={copy} />
            {error && <Action title="Copy Error" icon={Icon.Clipboard} onAction={copyError} />}
          </ActionPanel.Section>
        </ActionPanel>
      }
    >
      <Form.TextArea id="input" title="Input" placeholder="Paste JSON string here…" value={input} onChange={setInput} />
      {output && (
        <Form.TextArea
          id="output"
          title="Output"
          value={output}
          onChange={setOutput}
          info="Use Copy Output action to copy to clipboard"
        />
      )}
      {error && <Form.Description text={`⚠️ ${error}`} />}
    </Form>
  );
}
