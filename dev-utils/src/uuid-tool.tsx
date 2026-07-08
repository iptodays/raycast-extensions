import { useState, useCallback } from "react";
import { getRandomValues } from "./crypto-shim";
import { Form, ActionPanel, Action, Clipboard, showToast, Toast, Icon } from "@raycast/api";

const UUID_V4_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const UUID_V7_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function uuidV4(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

function uuidV7(): string {
  const now = Date.now();
  const bytes = new Uint8Array(16);
  // 48-bit timestamp (milliseconds since epoch)
  new DataView(bytes.buffer).setBigUint64(0, BigInt(now) << 16n, false);
  // version: 7
  bytes[6] = (bytes[6]! & 0x0f) | 0x70;
  // random
  crypto.getRandomValues(bytes.subarray(8));
  getRandomValues(bytes.subarray(8));
  // variant: 0b10
  bytes[8] = (bytes[8]! & 0x3f) | 0x80;
  // format
  const hex = Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export default function UuidTool() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [validation, setValidation] = useState("");

  const generateV4 = useCallback(() => {
    setOutput(uuidV4());
    setValidation("");
  }, []);

  const generateV7 = useCallback(() => {
    setOutput(uuidV7());
    setValidation("");
  }, []);

  const validate = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed) {
      setValidation("Please enter a UUID string");
      return;
    }
    if (UUID_V4_RE.test(trimmed)) {
      setValidation("✓ UUID v4");
    } else if (UUID_V7_RE.test(trimmed)) {
      setValidation("✓ UUID v7");
    } else {
      setValidation("✗ Not a valid UUID (v4 or v7)");
    }
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
          <ActionPanel.Section title="Generate">
            <Action title="Generate UUID v4" icon={Icon.RotateClockwise} onAction={generateV4} />
            <Action title="Generate UUID v7" icon={Icon.RotateClockwise} onAction={generateV7} />
          </ActionPanel.Section>
          <ActionPanel.Section title="Validate">
            <Action title="Validate UUID" icon={Icon.CheckCircle} onAction={validate} />
          </ActionPanel.Section>
          <ActionPanel.Section title="Copy">
            <Action title="Copy Output" icon={Icon.Clipboard} onAction={copy} />
          </ActionPanel.Section>
        </ActionPanel>
      }
    >
      <Form.TextField
        id="input"
        title="Input (optional)"
        placeholder="UUID string to validate…"
        value={input}
        onChange={setInput}
      />
      {output && (
        <Form.TextField id="output" title="Generated" value={output} onChange={setOutput} info="Use Copy to clipboard" />
      )}
      {validation && <Form.Description text={validation} />}
    </Form>
  );
}
