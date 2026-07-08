import { useState, useCallback } from "react";
import { Form, ActionPanel, Action, Clipboard, showToast, Toast, Icon } from "@raycast/api";

interface DecodedUUID {
  version: number;
  variant: string;
  timestamp?: string;
  clockSeq?: number;
  node?: string;
}

function decodeUUID(uuid: string): DecodedUUID | null {
  const cleaned = uuid.replace(/-/g, "");
  if (!/^[0-9a-f]{32}$/i.test(cleaned)) return null;

  const version = parseInt(cleaned[12]!, 16);
  const variantBits = parseInt(cleaned[16]!, 16);
  let variant = "RFC 4122 (DCE 1.1)";
  if ((variantBits & 0x8) === 0) variant = "NCS (Reserved)";
  else if ((variantBits & 0xc) === 0x8) variant = "RFC 4122 (DCE 1.1)";
  else if ((variantBits & 0xe) === 0xc) variant = "Microsoft (Reserved)";
  else variant = "Future (Reserved)";

  const decoded: DecodedUUID = { version, variant };

  if (version === 1) {
    const timeHex = cleaned.slice(0, 12);
    const timeInt = BigInt("0x" + timeHex);
    // UUID epoch is Oct 15, 1582
    const epoch = BigInt("0x01b21dd213814000");
    const ms = Number((timeInt - epoch) / BigInt(10000));
    decoded.timestamp = new Date(ms).toISOString().replace("T", " ").slice(0, 19);
    decoded.node = cleaned.slice(20, 32).replace(/(.{2})(?=[^ ])/g, "$1:").toUpperCase();
  }

  if (version === 7) {
    const ts = parseInt(cleaned.slice(0, 12), 16);
    decoded.timestamp = new Date(ts).toISOString().replace("T", " ").slice(0, 19);
  }

  return decoded;
}

export default function UuidDecoder() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const decode = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed) {
      setError("Please enter a UUID");
      return;
    }
    const result = decodeUUID(trimmed);
    if (!result) {
      setError("Invalid UUID format");
      return;
    }
    setError("");
    const parts = [
      `Version:  v${result.version}`,
      `Variant:  ${result.variant}`,
    ];
    if (result.timestamp) parts.push(`Time:     ${result.timestamp}`);
    if (result.node) parts.push(`Node:     ${result.node}`);
    setOutput(parts.join("\n"));
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
          <Action title="Decode UUID" icon={Icon.MagnifyingGlass} onAction={decode} />
          {output && <Action title="Copy Output" icon={Icon.Clipboard} onAction={copy} />}
        </ActionPanel>
      }
    >
      <Form.TextField
        id="input"
        title="UUID"
        placeholder="550e8400-e29b-41d4-a716-446655440000"
        value={input}
        onChange={setInput}
      />
      {output && <Form.TextArea id="output" title="Result" value={output} onChange={() => {}} />}
      {error && <Form.Description text={`⚠️ ${error}`} />}
    </Form>
  );
}
