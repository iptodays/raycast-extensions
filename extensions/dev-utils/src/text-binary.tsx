import { useState, useCallback } from "react";
import { Form, ActionPanel, Action, Clipboard, showToast, Toast, Icon } from "@raycast/api";

function textToBinary(text: string): string {
  return Array.from(text)
    .map((ch) => ch.codePointAt(0)!.toString(2).padStart(8, "0"))
    .join(" ");
}

function binaryToText(binary: string): string {
  const cleaned = binary.replace(/\s+/g, " ");
  const bytes = cleaned.split(" ");
  return bytes.map((b) => String.fromCodePoint(parseInt(b, 2))).join("");
}

function textToHex(text: string): string {
  return Array.from(text)
    .map((ch) => ch.codePointAt(0)!.toString(16).toUpperCase().padStart(2, "0"))
    .join(" ");
}

function hexToText(hex: string): string {
  const cleaned = hex.replace(/\s+/g, "");
  const bytes = cleaned.match(/.{2}/g) || [];
  return bytes.map((b) => String.fromCodePoint(parseInt(b, 16))).join("");
}

export default function TextToBinary() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<"bin" | "hex">("bin");
  const [direction, setDirection] = useState<"encode" | "decode">("encode");
  const [error, setError] = useState("");

  const convert = useCallback(() => {
    if (!input.trim()) {
      setError("Please enter text");
      return;
    }
    setError("");
    if (direction === "encode") {
      setOutput(mode === "bin" ? textToBinary(input) : textToHex(input));
    } else {
      try {
        setOutput(mode === "bin" ? binaryToText(input) : hexToText(input));
      } catch {
        setError("Invalid input for this mode");
      }
    }
  }, [input, mode, direction]);

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
        <Form.Dropdown.Item value="encode" title="Text → Binary/Hex" />
        <Form.Dropdown.Item value="decode" title="Binary/Hex → Text" />
      </Form.Dropdown>
      <Form.Dropdown id="mode" title="Mode" value={mode} onChange={(v) => setMode(v as "bin" | "hex")}>
        <Form.Dropdown.Item value="bin" title="Binary" />
        <Form.Dropdown.Item value="hex" title="Hex" />
      </Form.Dropdown>
      <Form.TextArea
        id="input"
        title="Input"
        placeholder={direction === "encode" ? "Hello" : "01001000 01100101"}
        value={input}
        onChange={setInput}
      />
      {output && <Form.TextArea id="output" title="Output" value={output} onChange={() => {}} />}
      {error && <Form.Description text={`⚠️ ${error}`} />}
    </Form>
  );
}
