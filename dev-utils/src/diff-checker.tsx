import { useState, useCallback } from "react";
import { Form, ActionPanel, Action, Clipboard, showToast, Toast, Icon } from "@raycast/api";

function computeDiff(left: string, right: string): string {
  const l = left.split("\n");
  const r = right.split("\n");
  const max = Math.max(l.length, r.length);
  const lines: string[] = [];

  for (let i = 0; i < max; i++) {
    const a = l[i] ?? "";
    const b = r[i] ?? "";
    if (a === b) {
      lines.push(`  ${a}`);
    } else {
      if (a !== undefined) lines.push(`- ${a}`);
      if (b !== undefined) lines.push(`+ ${b}`);
    }
  }
  return lines.join("\n");
}

export default function DiffChecker() {
  const [left, setLeft] = useState("");
  const [right, setRight] = useState("");
  const [output, setOutput] = useState("");

  const diff = useCallback(() => {
    setOutput(computeDiff(left, right));
  }, [left, right]);

  const copy = useCallback(async () => {
    if (!output) return;
    await Clipboard.copy(output);
    showToast(Toast.Style.Success, "Copied to clipboard");
  }, [output]);

  return (
    <Form
      actions={
        <ActionPanel>
          <Action title="Compare" icon={Icon.ArrowRight} onAction={diff} />
          {output && <Action title="Copy Diff" icon={Icon.Clipboard} onAction={copy} />}
        </ActionPanel>
      }
    >
      <Form.TextArea id="left" title="Left" placeholder="Original text…" value={left} onChange={setLeft} />
      <Form.TextArea id="right" title="Right" placeholder="Modified text…" value={right} onChange={setRight} />
      {output && <Form.TextArea id="output" title="Diff (- left, + right)" value={output} onChange={() => {}} />}
    </Form>
  );
}
