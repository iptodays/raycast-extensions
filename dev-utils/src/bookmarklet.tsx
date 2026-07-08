import { useState, useCallback } from "react";
import { Form, ActionPanel, Action, Clipboard, showToast, Toast, Icon } from "@raycast/api";

export default function BookmarkletTool() {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");

  const generate = useCallback(() => {
    if (!name.trim()) {
      showToast(Toast.Style.Failure, "Please enter a bookmarklet name");
      return;
    }
    if (!code.trim()) {
      showToast(Toast.Style.Failure, "Please enter JavaScript code");
      return;
    }

    // Wrap in IIFE and minify the code a bit
    const cleaned = code
      .replace(/\/\/.*$/gm, "")
      .replace(/\n\s*/g, " ")
      .replace(/\s{2,}/g, " ")
      .trim();

    const href = `javascript:${encodeURIComponent(`(function(){${cleaned}})()`)}`;
    const html = `<a href="${href}">${name.trim()}</a>`;

    setOutput(html);
  }, [name, code]);

  const copy = useCallback(async () => {
    if (!output) return;
    await Clipboard.copy(output);
    showToast(Toast.Style.Success, "Copied to clipboard");
  }, [output]);

  return (
    <Form
      actions={
        <ActionPanel>
          <Action title="Generate" icon={Icon.ArrowRight} onAction={generate} />
          {output && (
            <>
              <Action title="Copy HTML" icon={Icon.Clipboard} onAction={copy} />
              <Action
                title="Copy href Only"
                icon={Icon.Clipboard}
                onAction={async () => {
                  const href = output.match(/href="([^"]+)"/)?.[1];
                  if (href) {
                    await Clipboard.copy(href);
                    showToast(Toast.Style.Success, "Copied href to clipboard");
                  }
                }}
              />
            </>
          )}
        </ActionPanel>
      }
    >
      <Form.TextField
        id="name"
        title="Bookmarklet Name"
        placeholder="My Bookmarklet"
        value={name}
        onChange={setName}
      />
      <Form.TextArea
        id="code"
        title="JavaScript Code"
        placeholder={'alert("Hello from bookmarklet!");'}
        value={code}
        onChange={setCode}
      />
      {output && <Form.TextArea id="output" title="HTML Link" value={output} onChange={() => {}} />}
    </Form>
  );
}
