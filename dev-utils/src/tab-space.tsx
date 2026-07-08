import { useState, useCallback } from "react";
import { Form, ActionPanel, Action, Clipboard, showToast, Toast, Icon } from "@raycast/api";

export default function TabSpaceTool() {
  const [input, setInput] = useState("");
  const [tabSize, setTabSize] = useState("4");
  const [output, setOutput] = useState("");
  const [direction, setDirection] = useState<"tabs" | "spaces">("spaces");
  const [error, setError] = useState("");

  const convert = useCallback(() => {
    if (!input) {
      setError("Please enter text");
      return;
    }
    const size = parseInt(tabSize, 10) || 4;
    setError("");

    if (direction === "spaces") {
      setOutput(input.replace(/\t/g, " ".repeat(size)));
    } else {
      setOutput(input.replace(new RegExp(` {${size}}`, "g"), "\t"));
    }
  }, [input, tabSize, direction]);

  const copy = useCallback(async () => {
    if (!output) return;
    await Clipboard.copy(output);
    showToast(Toast.Style.Success, "Copied to clipboard");
  }, [output]);

  return (
    <Form
      actions={
        <ActionPanel>
          <Action title="Convert" icon={Icon.ArrowRight} onAction={convert} />
          {output && <Action title="Copy Output" icon={Icon.Clipboard} onAction={copy} />}
        </ActionPanel>
      }
    >
      <Form.Dropdown id="direction" title="Direction" value={direction} onChange={(v) => setDirection(v as "tabs" | "spaces")}>
        <Form.Dropdown.Item value="spaces" title="Tabs → Spaces" />
        <Form.Dropdown.Item value="tabs" title="Spaces → Tabs" />
      </Form.Dropdown>
      <Form.TextField id="tabSize" title="Tab Size" placeholder="4" value={tabSize} onChange={setTabSize} />
      <Form.TextArea
        id="input"
        title="Input"
        placeholder="Text with tabs or spaces…"
        value={input}
        onChange={setInput}
      />
      {output && <Form.TextArea id="output" title="Output" value={output} onChange={() => {}} />}
      {error && <Form.Description text={`⚠️ ${error}`} />}
    </Form>
  );
}
