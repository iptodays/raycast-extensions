import { useState, useCallback } from "react";
import { Form, ActionPanel, Action, Clipboard, showToast, Toast, Icon } from "@raycast/api";

function decodePEM(pem: string): string {
  const cleaned = pem
    .replace(/-----BEGIN [^-]+-----/g, "")
    .replace(/-----END [^-]+-----/g, "")
    .replace(/\s/g, "");

  const raw = Uint8Array.from(atob(cleaned), (c) => c.charCodeAt(0));

  // Try to decode as X.509 DER
  const lines: string[] = [];
  lines.push(`Raw bytes: ${raw.length}`);
  lines.push(`Base64 length: ${cleaned.length}`);

  if (raw.length > 20 && raw[0] === 0x30) {
    const len = raw[1] < 0x80 ? raw[1] : (raw[2]! << 8) | raw[3]!;
    lines.push(`DER structure: SEQUENCE (${len} bytes)`);

    // Find the algorithm OID
    const oidStart = pem.indexOf("BEGIN ") + 6;
    const oidEnd = pem.indexOf("-----", oidStart);
    const type = pem.slice(oidStart, oidEnd).trim();
    lines.push(`Type: ${type}`);

    if (type === "CERTIFICATE") {
      const serial = raw.slice(9, 15);
      const serialHex = Array.from(serial)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join(":");
      lines.push(`Serial (partial): ${serialHex}`);
    }

    if (type === "PRIVATE KEY" || type === "RSA PRIVATE KEY") {
      lines.push("Key type: Private key");
      lines.push(
        `First 16 bytes (hex): ${Array.from(raw.slice(0, 16))
          .map((b) => b.toString(16).padStart(2, "0"))
          .join(" ")}`,
      );
    }

    if (type === "PUBLIC KEY" || type === "RSA PUBLIC KEY") {
      lines.push("Key type: Public key");
    }
  }

  return lines.join("\n");
}

export default function PemDecoder() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const decode = useCallback(() => {
    if (!input.trim()) {
      setError("Please paste a PEM key or certificate");
      return;
    }
    if (!input.includes("-----BEGIN")) {
      setError("Not a valid PEM format — expected -----BEGIN ...-----");
      return;
    }
    setError("");
    setOutput(decodePEM(input));
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
          <Action title="Decode PEM" icon={Icon.MagnifyingGlass} onAction={decode} />
          {output && <Action title="Copy Output" icon={Icon.Clipboard} onAction={copy} />}
        </ActionPanel>
      }
    >
      <Form.TextArea
        id="input"
        title="PEM Data"
        placeholder="-----BEGIN CERTIFICATE-----&#10;..."
        value={input}
        onChange={setInput}
      />
      {output && <Form.TextArea id="output" title="Info" value={output} onChange={() => {}} />}
      {error && <Form.Description text={`⚠️ ${error}`} />}
    </Form>
  );
}
