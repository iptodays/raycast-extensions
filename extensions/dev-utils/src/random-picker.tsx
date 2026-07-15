import { useState, useCallback } from "react";
import { Form, ActionPanel, Action, Clipboard, showToast, Toast, Icon } from "@raycast/api";

export default function RandomPicker() {
  const [input, setInput] = useState("");
  const [count, setCount] = useState("1");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const pick = useCallback(() => {
    const items = input.split("\n").filter(Boolean);
    if (items.length === 0) {
      setError("Please enter items, one per line");
      return;
    }
    const n = Math.max(1, Math.min(items.length, parseInt(count, 10) || 1));

    // Fisher-Yates shuffle then take n
    const arr = [...items];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j]!, arr[i]!];
    }

    setError("");
    setOutput(arr.slice(0, n).join("\n"));
  }, [input, count]);

  const pickOne = useCallback(() => {
    const items = input.split("\n").filter(Boolean);
    if (items.length === 0) {
      setError("Please enter items");
      return;
    }
    setError("");
    setOutput(items[Math.floor(Math.random() * items.length)]!);
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
          <ActionPanel.Section title="Actions">
            <Action title="Pick Random" icon={Icon.ArrowRight} onAction={pick} />
            <Action title="Pick One" icon={Icon.Hourglass} onAction={pickOne} />
            <Action
              title="Shuffle All"
              icon={Icon.RotateClockwise}
              onAction={() => {
                const items = input.split("\n").filter(Boolean);
                if (items.length === 0) {
                  setError("Please enter items");
                  return;
                }
                setError("");
                for (let i = items.length - 1; i > 0; i--) {
                  const j = Math.floor(Math.random() * (i + 1));
                  [items[i], items[j]] = [items[j]!, items[i]!];
                }
                setOutput(items.join("\n"));
              }}
            />
          </ActionPanel.Section>
          {output && <Action title="Copy Output" icon={Icon.Clipboard} onAction={copy} />}
        </ActionPanel>
      }
    >
      <Form.TextArea id="input" title="Items" placeholder="One item per line" value={input} onChange={setInput} />
      <Form.TextField id="count" title="Number to Pick" placeholder="1" value={count} onChange={setCount} />
      {output && <Form.TextArea id="output" title="Result" value={output} onChange={() => {}} />}
      {error && <Form.Description text={`⚠️ ${error}`} />}
    </Form>
  );
}
