import { useState, useCallback } from "react";
import { Form, ActionPanel, Action, Clipboard, showToast, Toast, Icon } from "@raycast/api";

const BASE32_ALPH = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
const BASE58_ALPH = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

function base32Encode(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let result = "";
  let bits = 0;
  let value = 0;
  for (const b of bytes) {
    value = (value << 8) | b;
    bits += 8;
    while (bits >= 5) {
      bits -= 5;
      result += BASE32_ALPH[(value >>> bits) & 31];
    }
  }
  if (bits > 0) result += BASE32_ALPH[(value << (5 - bits)) & 31];
  // padding
  while (result.length % 8 !== 0) result += "=";
  return result;
}

function base32Decode(encoded: string): string {
  const cleaned = encoded.replace(/=+$/, "").toUpperCase();
  let bits = 0;
  let value = 0;
  const bytes: number[] = [];
  for (const ch of cleaned) {
    const idx = BASE32_ALPH.indexOf(ch);
    if (idx === -1) throw new Error("Invalid Base32 character");
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      bits -= 8;
      bytes.push((value >>> bits) & 255);
    }
  }
  return new TextDecoder().decode(new Uint8Array(bytes));
}

function base58Encode(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let num = BigInt(0);
  for (const b of bytes) num = (num << 8n) | BigInt(b);
  if (num === 0n) return "1";
  let result = "";
  const base = BigInt(58);
  while (num > 0n) {
    result = BASE58_ALPH[Number(num % base)] + result;
    num /= base;
  }
  return result;
}

function base58Decode(encoded: string): string {
  let num = BigInt(0);
  const base = BigInt(58);
  for (const ch of encoded) {
    const idx = BASE58_ALPH.indexOf(ch);
    if (idx === -1) throw new Error("Invalid Base58 character");
    num = num * base + BigInt(idx);
  }
  const bytes: number[] = [];
  while (num > 0n) {
    bytes.unshift(Number(num & 0xffn));
    num >>= 8n;
  }
  return new TextDecoder().decode(new Uint8Array(bytes));
}

export default function BaseEncode() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<"base32-enc" | "base32-dec" | "base58-enc" | "base58-dec">("base32-enc");
  const [error, setError] = useState("");

  const convert = useCallback(() => {
    if (!input.trim()) {
      setError("Please enter text");
      return;
    }
    try {
      setError("");
      switch (mode) {
        case "base32-enc":
          setOutput(base32Encode(input));
          break;
        case "base32-dec":
          setOutput(base32Decode(input));
          break;
        case "base58-enc":
          setOutput(base58Encode(input));
          break;
        case "base58-dec":
          setOutput(base58Decode(input));
          break;
      }
    } catch (e) {
      setError(`Error: ${(e as Error).message}`);
    }
  }, [input, mode]);

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
      <Form.Dropdown id="mode" title="Mode" value={mode} onChange={(v) => setMode(v as typeof mode)}>
        <Form.Dropdown.Item value="base32-enc" title="Base32 Encode" />
        <Form.Dropdown.Item value="base32-dec" title="Base32 Decode" />
        <Form.Dropdown.Item value="base58-enc" title="Base58 Encode" />
        <Form.Dropdown.Item value="base58-dec" title="Base58 Decode" />
      </Form.Dropdown>
      <Form.TextArea
        id="input"
        title="Input"
        placeholder="Text to encode or decode…"
        value={input}
        onChange={setInput}
      />
      {output && <Form.TextArea id="output" title="Output" value={output} onChange={() => {}} />}
      {error && <Form.Description text={`⚠️ ${error}`} />}
    </Form>
  );
}
