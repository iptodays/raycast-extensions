import { useState, useCallback } from "react";
import { Form, ActionPanel, Action, Clipboard, showToast, Toast, Icon } from "@raycast/api";

function shannonEntropy(password: string): number {
  const len = password.length;
  if (len === 0) return 0;
  const freq: Record<string, number> = {};
  for (const ch of password) freq[ch] = (freq[ch] || 0) + 1;
  return -Object.values(freq).reduce((sum, c) => {
    const p = c / len;
    return sum + p * Math.log2(p);
  }, 0);
}

function charsetEntropy(password: string): number {
  let pool = 0;
  if (/[a-z]/.test(password)) pool += 26;
  if (/[A-Z]/.test(password)) pool += 26;
  if (/\d/.test(password)) pool += 10;
  if (/[^a-zA-Z0-9]/.test(password)) pool += 33;
  return Math.round(Math.log2(pool) * password.length);
}

function scorePassword(password: string): { score: number; label: string; color: string } {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (password.length >= 16) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;
  if (password.length >= 20) score++;
  if (password.length >= 32) score++;

  if (score <= 2) return { score, label: "Weak", color: "🔴" };
  if (score <= 4) return { score, label: "Fair", color: "🟡" };
  if (score <= 6) return { score, label: "Strong", color: "🟢" };
  return { score, label: "Very Strong", color: "🟢" };
}

export default function PasswordStrength() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [visible, setVisible] = useState(false);

  const check = useCallback(() => {
    if (!input) {
      setOutput("");
      return;
    }
    const shannon = shannonEntropy(input);
    const bits = charsetEntropy(input);
    const { score, label, color } = scorePassword(input);

    setOutput(
      [
        `${color}  ${label}`,
        `Score: ${score}/8`,
        `Length: ${input.length}`,
        `Entropy (charset): ~${bits} bits`,
        `Entropy (Shannon): ${shannon.toFixed(2)} bits`,
        `Uppercase: ${/[A-Z]/.test(input) ? "✓" : "✗"}`,
        `Lowercase: ${/[a-z]/.test(input) ? "✓" : "✗"}`,
        `Digits: ${/\d/.test(input) ? "✓" : "✗"}`,
        `Symbols: ${/[^a-zA-Z0-9]/.test(input) ? "✓" : "✗"}`,
      ].join("\n")
    );
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
          <Action title="Check Strength" icon={Icon.Shield} onAction={check} />
          {output && <Action title="Copy Result" icon={Icon.Clipboard} onAction={copy} />}
        </ActionPanel>
      }
    >
      <Form.PasswordField
        id="input"
        title="Password"
        placeholder="Enter password to check…"
        value={input}
        onChange={setInput}
      />
      {output && <Form.TextArea id="output" title="Result" value={output} onChange={() => {}} />}
    </Form>
  );
}
