import { useState, useCallback } from "react";
import { Form, ActionPanel, Action, Clipboard, showToast, Toast, Icon } from "@raycast/api";

const BASE85_ALPH = "!\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~";

function base85Encode(text: string): string {
  const bytes = new TextEncoder().encode(text);
  const result: string[] = [];
  result.push("<~");

  for (let i = 0; i < bytes.length; i += 4) {
    let value = 0;
    for (let j = 0; j < 4; j++) {
      value = (value << 8) | (bytes[i + j] ?? 0);
    }
    // Last chunk padding
    const chunkLen = Math.min(4, bytes.length - i);
    if (chunkLen < 4) {
      value = value >>> (8 * (4 - chunkLen));
    }

    const chars: string[] = [];
    for (let k = 0; k < 5; k++) {
      chars.unshift(BASE85_ALPH[value % 85]!);
      value = Math.floor(value / 85);
    }
    result.push(...chars);
  }

  result.push("~>");
  return result.join("");
}

function base85Decode(encoded: string): string {
  const cleaned = encoded.replace(/<~|~>/g, "").replace(/\s/g, "");
  const bytes: number[] = [];
  let i = 0;

  while (i < cleaned.length) {
    const chunk = cleaned.slice(i, i + 5);
    if (chunk.length === 0) break;

    let value = 0;
    for (const ch of chunk) {
      value = value * 85 + BASE85_ALPH.indexOf(ch);
    }

    const outLen = chunk.length === 5 ? 4 : chunk.length - 1;
    for (let j = outLen - 1; j >= 0; j--) {
      bytes.push((value >>> (j * 8)) & 0xff);
    }
    i += chunk.length;
  }

  return new TextDecoder().decode(new Uint8Array(bytes));
}

export default function Base85Tool() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [direction, setDirection] = useState<"encode" | "decode">("encode");
  const [error, setError] = useState("");

  const convert = useCallback(() => {
    if (!input.trim()) {
      setError("Please enter text");
      return;
    }
    try {
      setError("");
      setOutput(direction === "encode" ? base85Encode(input) : base85Decode(input));
    } catch {
      setError("Conversion failed");
    }
  }, [input, direction]);

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
      <Form.Dropdown
        id="direction"
        title="Direction"
        value={direction}
        onChange={(v) => setDirection(v as "encode" | "decode")}
      >
        <Form.Dropdown.Item value="encode" title="Text → ASCII85" />
        <Form.Dropdown.Item value="decode" title="ASCII85 → Text" />
      </Form.Dropdown>
      <Form.TextArea
        id="input"
        title="Input"
        placeholder={direction === "encode" ? "Hello, World!" : "<~87cURD_*#TDfTZ)+T~>"}
        value={input}
        onChange={setInput}
      />
      {output && <Form.TextArea id="output" title="Output" value={output} onChange={() => {}} />}
      {error && <Form.Description text={`⚠️ ${error}`} />}
    </Form>
  );
}
