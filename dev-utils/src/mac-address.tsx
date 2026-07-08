import { useState, useCallback } from "react";
import { Form, ActionPanel, Action, Clipboard, showToast, Toast, Icon } from "@raycast/api";

function cleanMAC(mac: string): string {
  return mac.replace(/[^0-9a-fA-F]/g, "").toUpperCase();
}

function formatMAC(mac: string): string {
  const c = cleanMAC(mac);
  if (c.length !== 12) return "";
  return c.match(/.{2}/g)!.join(":");
}

function isValidMAC(mac: string): boolean {
  return cleanMAC(mac).length === 12;
}

import { getRandomValues } from "./crypto-shim";

function randomMAC(): string {
  const arr = new Uint8Array(6);
  getRandomValues(arr);
  arr[0] = (arr[0]! & 0xfe) | 0x02; // locally administered, unicast
  return Array.from(arr)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join(":")
    .toUpperCase();
}

export default function MacAddressTool() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const format = useCallback(() => {
    if (!input.trim()) {
      setError("Please enter a MAC address");
      return;
    }
    const f = formatMAC(input);
    if (!f) {
      setError("Invalid MAC address — expected 12 hex digits (e.g. AA:BB:CC:DD:EE:FF)");
      return;
    }
    setOutput(f);
    setError("");
  }, [input]);

  const validate = useCallback(() => {
    if (!input.trim()) {
      setError("Please enter a MAC address");
      return;
    }
    setOutput(isValidMAC(input) ? "✓ Valid MAC address" : "✗ Invalid MAC address");
    setError("");
  }, [input]);

  const generate = useCallback(() => {
    setOutput(randomMAC());
    setError("");
  }, []);

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
            <Action title="Format" icon={Icon.ArrowRight} onAction={format} />
            <Action title="Validate" icon={Icon.CheckCircle} onAction={validate} />
            <Action title="Generate Random" icon={Icon.RotateClockwise} onAction={generate} />
          </ActionPanel.Section>
          {output && <Action title="Copy Output" icon={Icon.Clipboard} onAction={copy} />}
        </ActionPanel>
      }
    >
      <Form.TextField
        id="input"
        title="MAC Address"
        placeholder="aa:bb:cc:dd:ee:ff"
        value={input}
        onChange={setInput}
      />
      {output && <Form.TextField id="output" title="Result" value={output} onChange={() => {}} />}
      {error && <Form.Description text={`⚠️ ${error}`} />}
    </Form>
  );
}
