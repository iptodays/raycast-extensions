import { useState, useCallback } from "react";
import { Form, ActionPanel, Action, Clipboard, showToast, Toast, Icon } from "@raycast/api";

function explainCIDR(cidr: string): string {
  const m = cidr.trim().match(/^(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\/(\d{1,2})$/);
  if (!m) return "";

  const ip = m[1]!;
  const bits = parseInt(m[2]!, 10);
  if (bits < 0 || bits > 32) return "";

  const octets = ip.split(".").map(Number);
  if (octets.some((o) => o < 0 || o > 255)) return "";

  const ipInt = octets.reduce((acc, o) => (acc << 8) + o, 0);
  const mask = bits === 0 ? 0 : ~0 << (32 - bits);
  const network = ipInt & mask;
  const broadcast = network | ~mask;

  const toIP = (n: number) => [
    (n >>> 24) & 255,
    (n >>> 16) & 255,
    (n >>> 8) & 255,
    n & 255,
  ].join(".");

  const maskOctets = [
    (mask >>> 24) & 255,
    (mask >>> 16) & 255,
    (mask >>> 8) & 255,
    mask & 255,
  ];

  const total = 2 ** (32 - bits);
  const usable = total >= 2 ? total - 2 : total;

  return [
    `Address:     ${ip}`,
    `Netmask:     ${maskOctets.join(".")} / ${bits}`,
    `Network:     ${toIP(network)}`,
    `Broadcast:   ${toIP(broadcast)}`,
    `Host Range:  ${total >= 2 ? `${toIP(network + 1)} — ${toIP(broadcast - 1)}` : "N/A"}`,
    `Total Hosts: ${total}`,
    `Usable:      ${usable}`,
  ].join("\n");
}

export default function IpCalculator() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const calculate = useCallback(() => {
    if (!input.trim()) {
      setError("Please enter a CIDR notation (e.g. 192.168.1.0/24)");
      return;
    }
    const result = explainCIDR(input);
    if (!result) {
      setError("Invalid CIDR notation. Try 192.168.1.0/24");
      setOutput("");
      return;
    }
    setError("");
    setOutput(result);
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
          <Action title="Calculate" icon={Icon.ArrowRight} onAction={calculate} />
          {output && <Action title="Copy Output" icon={Icon.Clipboard} onAction={copy} />}
        </ActionPanel>
      }
    >
      <Form.TextField
        id="input"
        title="CIDR Notation"
        placeholder="192.168.1.0/24"
        value={input}
        onChange={setInput}
      />
      {output && <Form.TextArea id="output" title="Result" value={output} onChange={() => {}} />}
      {error && <Form.Description text={`⚠️ ${error}`} />}
    </Form>
  );
}
