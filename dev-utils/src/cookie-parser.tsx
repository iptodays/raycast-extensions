import { useState, useCallback } from "react";
import { Form, ActionPanel, Action, Clipboard, showToast, Toast, Icon } from "@raycast/api";

function parseCookie(cookie: string): Record<string, string> {
  const result: Record<string, string> = {};
  for (const pair of cookie.split(";")) {
    const eq = pair.indexOf("=");
    if (eq === -1) continue;
    const key = pair.slice(0, eq).trim();
    const val = pair.slice(eq + 1).trim();
    result[key] = decodeURIComponent(val);
  }
  return result;
}

export default function CookieParser() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  const parse = useCallback(() => {
    if (!input.trim()) {
      showToast(Toast.Style.Failure, "Please enter a cookie string");
      return;
    }
    const parsed = parseCookie(input);
    const lines = Object.entries(parsed).map(
      ([key, val]) => `${key} = ${val.length > 100 ? val.slice(0, 100) + "…" : val}`,
    );
    setOutput(
      [
        `${lines.length} cookie${lines.length !== 1 ? "s" : ""}:`,
        ...lines,
        "",
        "--- Raw JSON ---",
        JSON.stringify(parsed, null, 2),
      ].join("\n"),
    );
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
          <Action title="Parse Cookie" icon={Icon.MagnifyingGlass} onAction={parse} />
          {output && <Action title="Copy Output" icon={Icon.Clipboard} onAction={copy} />}
        </ActionPanel>
      }
    >
      <Form.TextArea
        id="input"
        title="Cookie String"
        placeholder="sessionId=abc123; theme=dark; lang=en"
        value={input}
        onChange={setInput}
      />
      {output && <Form.TextArea id="output" title="Parsed" value={output} onChange={() => {}} />}
    </Form>
  );
}
