import { useState, useCallback } from "react";
import { Form, ActionPanel, Action, Clipboard, showToast, Toast, Icon } from "@raycast/api";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function SlugGenerator() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  const generate = useCallback(() => {
    if (!input.trim()) {
      showToast(Toast.Style.Failure, "Please enter text");
      return;
    }
    setOutput(slugify(input));
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
          <Action title="Generate Slug" icon={Icon.ArrowRight} onAction={generate} />
          {output && <Action title="Copy Output" icon={Icon.Clipboard} onAction={copy} />}
        </ActionPanel>
      }
    >
      <Form.TextArea
        id="input"
        title="Text"
        placeholder="Hello World! This is a Title"
        value={input}
        onChange={setInput}
      />
      {output && <Form.TextField id="output" title="Slug" value={output} onChange={() => {}} />}
    </Form>
  );
}
