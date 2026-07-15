import { useState, useCallback } from "react";
import { Form, ActionPanel, Action, Clipboard, showToast, Toast, Icon } from "@raycast/api";

import { getRandomValues } from "./crypto-shim";

function randomInt(min: number, max: number): number {
  const range = max - min + 1;
  const arr = new Uint32Array(1);
  getRandomValues(new Uint8Array(arr.buffer));
  return min + (arr[0]! % range);
}

function randomHex(bytes: number): string {
  const arr = new Uint8Array(bytes);
  getRandomValues(arr);
  return Array.from(arr, (b) => b.toString(16).padStart(2, "0")).join("");
}

function randomString(len: number, chars: string): string {
  const arr = new Uint8Array(len);
  getRandomValues(arr);
  return Array.from(arr, (b) => chars[b % chars.length]).join("");
}

export default function RandomGenerator() {
  const [count, setCount] = useState("1");
  const [output, setOutput] = useState("");

  const genInt = useCallback(() => {
    const c = Math.max(1, Math.min(50, parseInt(count, 10) || 1));
    const vals = Array.from({ length: c }, () => String(randomInt(0, 999999)));
    setOutput(vals.join("\n"));
  }, [count]);

  const genHex = useCallback(() => {
    const c = Math.max(1, Math.min(50, parseInt(count, 10) || 1));
    const vals = Array.from({ length: c }, () => randomHex(16));
    setOutput(vals.join("\n"));
  }, [count]);

  const genAlphaNum = useCallback(() => {
    const c = Math.max(1, Math.min(50, parseInt(count, 10) || 1));
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const vals = Array.from({ length: c }, () => randomString(16, chars));
    setOutput(vals.join("\n"));
  }, [count]);

  const copy = useCallback(async () => {
    if (!output) return;
    await Clipboard.copy(output);
    showToast(Toast.Style.Success, "Copied to clipboard");
  }, [output]);

  return (
    <Form
      actions={
        <ActionPanel>
          <ActionPanel.Section title="Generate">
            <Action title="Random Integers (0–999999)" icon={Icon.Number00} onAction={genInt} />
            <Action title="Random Hex (128-bit)" icon={Icon.Code} onAction={genHex} />
            <Action title="Random Alphanumeric (16 chars)" icon={Icon.Text} onAction={genAlphaNum} />
          </ActionPanel.Section>
          {output && (
            <ActionPanel.Section title="Copy">
              <Action title="Copy Output" icon={Icon.Clipboard} onAction={copy} />
            </ActionPanel.Section>
          )}
        </ActionPanel>
      }
    >
      <Form.TextField id="count" title="Number of Values" placeholder="1" value={count} onChange={setCount} />
      {output && <Form.TextArea id="output" title="Output" value={output} onChange={setOutput} />}
    </Form>
  );
}
