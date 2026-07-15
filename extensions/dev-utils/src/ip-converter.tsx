import { useState, useCallback } from "react";
import { Form, ActionPanel, Action, Clipboard, showToast, Toast, Icon } from "@raycast/api";

function ipToInt(ip: string): number | null {
  const parts = ip.split(".").map(Number);
  if (parts.length !== 4 || parts.some((p) => isNaN(p) || p < 0 || p > 255)) return null;
  return ((parts[0]! << 24) | (parts[1]! << 16) | (parts[2]! << 8) | parts[3]!) >>> 0;
}

function intToIp(n: number): string {
  return [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join(".");
}

export default function IpConverter() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const convert = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed) {
      setError("Please enter an IP address or integer");
      return;
    }

    // IP address → integer
    if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(trimmed)) {
      const int = ipToInt(trimmed);
      if (int === null) {
        setError("Invalid IPv4 address");
        return;
      }
      setError("");
      setOutput(
        `IPv4: ${trimmed}\nHex:  0x${int.toString(16).toUpperCase().padStart(8, "0")}\nInt:  ${int}\nBin:  ${int.toString(2).padStart(32, "0")}`,
      );
      return;
    }

    // Integer → IP address
    const int = parseInt(trimmed, 10);
    if (!isNaN(int) && int >= 0 && int <= 4294967295) {
      setError("");
      setOutput(`Int:  ${int}\nHex:  0x${int.toString(16).toUpperCase().padStart(8, "0")}\nIPv4: ${intToIp(int)}`);
      return;
    }

    // Hex → IP
    const hexMatch = trimmed.match(/^0x([0-9a-f]{1,8})$/i);
    if (hexMatch) {
      const int = parseInt(hexMatch[1]!, 16);
      setError("");
      setOutput(`Hex:  ${trimmed.toUpperCase()}\nInt:  ${int}\nIPv4: ${intToIp(int)}`);
      return;
    }

    setError(`Cannot parse "${trimmed}". Try an IP (192.168.1.1) or integer (3232235777).`);
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
          <Action title="Convert" icon={Icon.ArrowRight} onAction={convert} />
          {output && <Action title="Copy Output" icon={Icon.Clipboard} onAction={copy} />}
        </ActionPanel>
      }
    >
      <Form.TextField
        id="input"
        title="IP Address or Integer"
        placeholder="192.168.1.1 or 3232235777"
        value={input}
        onChange={setInput}
      />
      {output && <Form.TextArea id="output" title="Result" value={output} onChange={() => {}} />}
      {error && <Form.Description text={`⚠️ ${error}`} />}
    </Form>
  );
}
