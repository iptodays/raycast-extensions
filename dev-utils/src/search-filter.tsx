import { useState, useCallback } from "react";
import { Form, ActionPanel, Action, Clipboard, showToast, Toast, Icon } from "@raycast/api";

export default function SearchFilterTool() {
  const [text, setText] = useState("");
  const [query, setQuery] = useState("");
  const [regex, setRegex] = useState(false);
  const [output, setOutput] = useState("");
  const [count, setCount] = useState(0);
  const [error, setError] = useState("");

  const doGrep = useCallback(() => {
    if (!text.trim() || !query.trim()) {
      setError("Please enter text and a search term");
      return;
    }
    try {
      setError("");
      const re = regex ? new RegExp(query) : new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
      const lines = text.split("\n");
      const matched = lines.filter((l) => re.test(l));
      setCount(matched.length);
      setOutput(matched.join("\n"));
    } catch (e) {
      setError(`Invalid regex: ${(e as Error).message}`);
    }
  }, [text, query, regex]);

  const copy = useCallback(async () => {
    if (!output) return;
    await Clipboard.copy(output);
    showToast(Toast.Style.Success, "Copied to clipboard");
  }, [output]);

  return (
    <Form
      actions={
        <ActionPanel>
          <Action title="Filter" icon={Icon.Filter} onAction={doGrep} />
          {output && (
            <>
              <Action title="Copy Output" icon={Icon.Clipboard} onAction={copy} />
              <Action
                title="Copy Match Count"
                icon={Icon.Number00}
                onAction={async () => {
                  await Clipboard.copy(String(count));
                  showToast(Toast.Style.Success, "Copied to clipboard");
                }}
              />
            </>
          )}
        </ActionPanel>
      }
    >
      <Form.TextArea id="text" title="Text" placeholder="Lines to search…" value={text} onChange={setText} />
      <Form.TextField id="query" title="Search" placeholder="Term or pattern…" value={query} onChange={setQuery} />
      <Form.Checkbox id="regex" label="Use Regex" value={regex} onChange={setRegex} />
      {output && (
        <>
          <Form.Description text={`${count} line${count !== 1 ? "s" : ""} matched`} />
          <Form.TextArea id="output" title="Filtered" value={output} onChange={() => {}} />
        </>
      )}
      {error && <Form.Description text={`⚠️ ${error}`} />}
    </Form>
  );
}
