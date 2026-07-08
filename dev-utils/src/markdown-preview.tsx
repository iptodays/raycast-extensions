import { useState, useCallback } from "react";
import { ActionPanel, Action, Form, Icon, showToast, Toast, Clipboard } from "@raycast/api";

function renderMarkdown(md: string): string {
  return md;
}

export default function MarkdownPreview() {
  const [input, setInput] = useState("");

  const copyHtml = useCallback(async () => {
    if (!input) return;
    await Clipboard.copy(input);
    showToast(Toast.Style.Success, "Copied to clipboard");
  }, [input]);

  return (
    <Form
      actions={
        <ActionPanel>
          {input && (
            <>
              <Action
                title="Copy Markdown"
                icon={Icon.Clipboard}
                onAction={copyHtml}
              />
              <Action.OpenInBrowser
                title="Preview in Browser"
                icon={Icon.Globe}
                url={`data:text/markdown,${encodeURIComponent(input)}`}
              />
            </>
          )}
        </ActionPanel>
      }
    >
      <Form.TextArea
        id="input"
        title="Markdown Source"
        placeholder="# Hello\nThis is **bold** and *italic*."
        value={input}
        onChange={setInput}
      />
    </Form>
  );
}
