import { useState, useCallback } from "react";
import { Form, ActionPanel, Action, Clipboard, showToast, Toast, Icon } from "@raycast/api";

function caesar(text: string, shift: number): string {
  return text.replace(/[a-zA-Z]/g, (ch) => {
    const base = ch <= "Z" ? 65 : 97;
    return String.fromCodePoint(((ch.codePointAt(0)! - base + shift + 26) % 26) + base);
  });
}

function rot13(text: string): string {
  return caesar(text, 13);
}

export default function CaesarCipher() {
  const [input, setInput] = useState("");
  const [shift, setShift] = useState("13");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const encode = useCallback(() => {
    if (!input.trim()) {
      setError("Please enter text");
      return;
    }
    const s = parseInt(shift, 10);
    if (isNaN(s)) {
      setError("Shift must be a number");
      return;
    }
    setError("");
    setOutput(caesar(input, s));
  }, [input, shift]);

  const decode = useCallback(() => {
    if (!input.trim()) {
      setError("Please enter text");
      return;
    }
    const s = parseInt(shift, 10);
    if (isNaN(s)) {
      setError("Shift must be a number");
      return;
    }
    setError("");
    setOutput(caesar(input, 26 - s));
  }, [input, shift]);

  const doRot13 = useCallback(() => {
    if (!input.trim()) {
      setError("Please enter text");
      return;
    }
    setError("");
    setOutput(rot13(input));
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
            <Action title="Encode" icon={Icon.Lock} onAction={encode} />
            <Action title="Decode" icon={Icon.LockUnlocked} onAction={decode} />
            <Action title="ROT13" icon={Icon.RotateClockwise} onAction={doRot13} />
          </ActionPanel.Section>
          {output && <Action title="Copy Output" icon={Icon.Clipboard} onAction={copy} />}
        </ActionPanel>
      }
    >
      <Form.TextField id="shift" title="Shift" placeholder="13" value={shift} onChange={setShift} />
      <Form.TextArea
        id="input"
        title="Text"
        placeholder="Hello, World!"
        value={input}
        onChange={setInput}
      />
      {output && <Form.TextArea id="output" title="Output" value={output} onChange={() => {}} />}
      {error && <Form.Description text={`⚠️ ${error}`} />}
    </Form>
  );
}
