import { useState, useCallback } from "react";
import { Form, ActionPanel, Action, Clipboard, showToast, Toast, Icon } from "@raycast/api";

export default function HtmlPreview() {
  const [input, setInput] = useState("");
  const [error, setError] = useState("");

  const copy = useCallback(async () => {
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
                title="Copy HTML"
                icon={Icon.Clipboard}
                onAction={copy}
              />
              <Action.OpenInBrowser
                title="Preview in Browser"
                icon={Icon.Globe}
                url={`data:text/html,${encodeURIComponent(input)}`}
              />
            </>
          )}
        </ActionPanel>
      }
    >
      <Form.TextArea
        id="input"
        title="HTML Source"
        placeholder="<h1>Hello World</h1>"
        value={input}
        onChange={setInput}
      />
      {error && <Form.Description text={`⚠️ ${error}`} />}
    </Form>
  );
}
