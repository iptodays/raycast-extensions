import { useState, useCallback } from "react";
import { Form, ActionPanel, Action, Clipboard, showToast, Toast, Icon } from "@raycast/api";

interface Options {
  length: number;
  uppercase: boolean;
  lowercase: boolean;
  digits: boolean;
  symbols: boolean;
  count: number;
}

const SYMBOLS = "!@#$%^&*()_+-=[]{}|;:,.<>?";

import { getRandomValues } from "./crypto-shim";

function generatePassword(opts: Options): string {
  let chars = "";
  if (opts.uppercase) chars += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  if (opts.lowercase) chars += "abcdefghijklmnopqrstuvwxyz";
  if (opts.digits) chars += "0123456789";
  if (opts.symbols) chars += SYMBOLS;

  if (!chars) chars = "abcdefghijklmnopqrstuvwxyz";

  const arr = new Uint8Array(opts.length);
  getRandomValues(arr);
  return Array.from(arr, (b) => chars[b % chars.length]).join("");
}

function entropy(opts: Options): number {
  let pool = 0;
  if (opts.uppercase) pool += 26;
  if (opts.lowercase) pool += 26;
  if (opts.digits) pool += 10;
  if (opts.symbols) pool += SYMBOLS.length;
  if (!pool) pool = 26;
  return Math.round(Math.log2(pool) * opts.length);
}

export default function PasswordGenerator() {
  const [length, setLength] = useState("16");
  const [uppercase, setUppercase] = useState(true);
  const [lowercase, setLowercase] = useState(true);
  const [digits, setDigits] = useState(true);
  const [symbols, setSymbols] = useState(true);
  const [count, setCount] = useState("4");
  const [output, setOutput] = useState("");

  const generate = useCallback(() => {
    const opts: Options = {
      length: Math.max(1, Math.min(128, parseInt(length, 10) || 16)),
      uppercase,
      lowercase,
      digits,
      symbols,
      count: Math.max(1, Math.min(20, parseInt(count, 10) || 4)),
    };

    const passwords = Array.from({ length: opts.count }, () => generatePassword(opts));
    setOutput(passwords.join("\n"));

    const ent = entropy(opts);
    showToast(Toast.Style.Success, `Entropy: ~${ent} bits`);
  }, [length, uppercase, lowercase, digits, symbols, count]);

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
            <Action title="Generate" icon={Icon.LockUnlocked} onAction={generate} />
          </ActionPanel.Section>
          <ActionPanel.Section title="Copy">
            <Action title="Copy Output" icon={Icon.Clipboard} onAction={copy} />
          </ActionPanel.Section>
        </ActionPanel>
      }
    >
      <Form.TextField
        id="length"
        title="Password Length"
        placeholder="16"
        value={length}
        onChange={setLength}
      />
      <Form.TextField
        id="count"
        title="Number of Passwords"
        placeholder="4"
        value={count}
        onChange={setCount}
      />
      <Form.Checkbox id="uppercase" label="Include Uppercase (A-Z)" value={uppercase} onChange={setUppercase} />
      <Form.Checkbox id="lowercase" label="Include Lowercase (a-z)" value={lowercase} onChange={setLowercase} />
      <Form.Checkbox id="digits" label="Include Digits (0-9)" value={digits} onChange={setDigits} />
      <Form.Checkbox id="symbols" label="Include Symbols (!@#$%…)" value={symbols} onChange={setSymbols} />
      {output && (
        <Form.TextArea
          id="output"
          title="Generated Passwords"
          value={output}
          onChange={setOutput}
          info="Use Copy Output to copy to clipboard"
        />
      )}
    </Form>
  );
}
