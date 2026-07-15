import { useState, useCallback } from "react";
import { Form, ActionPanel, Action, Clipboard, showToast, Toast, Icon } from "@raycast/api";

export default function TextReplacer() {
  const [text, setText] = useState("");
  const [search, setSearch] = useState("");
  const [replace, setReplace] = useState("");
  const [regex, setRegex] = useState(false);
  const [output, setOutput] = useState("");
  const [count, setCount] = useState(0);
  const [error, setError] = useState("");

  const doReplace = useCallback(() => {
    if (!text.trim() || !search.trim()) {
      setError("Please enter text and a search string");
      return;
    }
    try {
      setError("");
      if (regex) {
        const re = new RegExp(search, "g");
        const matches = text.match(re);
        setCount(matches?.length ?? 0);
        setOutput(text.replace(re, replace));
      } else {
        let c = 0;
        const result = text.split(search).join(replace);
        c = (text.match(new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) || []).length;
        setCount(c);
        setOutput(result);
      }
    } catch (e) {
      setError(`Invalid regex: ${(e as Error).message}`);
    }
  }, [text, search, replace, regex]);

  const copy = useCallback(async () => {
    if (!output) return;
    await Clipboard.copy(output);
    showToast(Toast.Style.Success, "Copied to clipboard");
  }, [output]);

  return (
    <Form
      actions={
        <ActionPanel>
          <Action title="Replace All" icon={Icon.ArrowRight} onAction={doReplace} />
          {output && <Action title="Copy Output" icon={Icon.Clipboard} onAction={copy} />}
        </ActionPanel>
      }
    >
      <Form.TextArea id="text" title="Text" placeholder="Original text…" value={text} onChange={setText} />
      <Form.TextField id="search" title="Find" placeholder="Text or pattern…" value={search} onChange={setSearch} />
      <Form.TextField id="replace" title="Replace With" placeholder="" value={replace} onChange={setReplace} />
      <Form.Checkbox id="regex" label="Use Regex" value={regex} onChange={setRegex} />
      {output && (
        <>
          <Form.Description text={`${count} replacement${count !== 1 ? "s" : ""}`} />
          <Form.TextArea id="output" title="Result" value={output} onChange={() => {}} />
        </>
      )}
      {error && <Form.Description text={`⚠️ ${error}`} />}
    </Form>
  );
}
