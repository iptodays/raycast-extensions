import { useState, useMemo } from "react";
import { Form, ActionPanel, Action, Clipboard, showToast, Toast, Icon } from "@raycast/api";

function getUnicodeInfo(cp: number) {
  const ch = String.fromCodePoint(cp);
  let category = "Other";
  if (cp >= 0x41 && cp <= 0x5a) category = "Uppercase Letter";
  else if (cp >= 0x61 && cp <= 0x7a) category = "Lowercase Letter";
  else if (cp >= 0x30 && cp <= 0x39) category = "Digit";
  else if (cp >= 0x4e00 && cp <= 0x9fff) category = "CJK Ideograph";
  else if (cp >= 0x3040 && cp <= 0x309f) category = "Hiragana";
  else if (cp >= 0x30a0 && cp <= 0x30ff) category = "Katakana";
  else if (cp >= 0xac00 && cp <= 0xd7af) category = "Hangul Syllable";
  else if (cp >= 0x0600 && cp <= 0x06ff) category = "Arabic";
  else if (cp >= 0x0400 && cp <= 0x04ff) category = "Cyrillic";
  else if (cp >= 0x1f300 && cp <= 0x1f9ff) category = "Emoji / Symbol";
  else if (cp < 0x80) category = "ASCII";

  return { ch, category, hex: `U+${cp.toString(16).toUpperCase().padStart(4, "0")}`, code: cp };
}

export default function UnicodeLookup() {
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const lookup = () => {
    const trimmed = code.trim();
    if (!trimmed) {
      setError("Please enter a code point or character");
      return;
    }

    let cp: number;
    if (/^[0-9a-f]+$/i.test(trimmed)) {
      cp = parseInt(trimmed, 16);
    } else if (/^U\+[0-9a-f]+$/i.test(trimmed)) {
      cp = parseInt(trimmed.replace(/^U\+/i, ""), 16);
    } else if (/^\d+$/.test(trimmed)) {
      cp = parseInt(trimmed, 10);
    } else {
      cp = trimmed.codePointAt(0)!;
    }

    if (isNaN(cp) || cp < 0 || cp > 0x10ffff) {
      setError("Code point must be between 0 and 0x10FFFF");
      return;
    }

    setError("");
    const info = getUnicodeInfo(cp);
    setOutput(
      [
        `Character: ${info.ch}`,
        `Code Point: ${info.hex}`,
        `Decimal: ${info.code}`,
        `Category: ${info.category}`,
      ].join("\n")
    );
  };

  const copy = async () => {
    if (!output) return;
    await Clipboard.copy(output);
    showToast(Toast.Style.Success, "Copied to clipboard");
  };

  return (
    <Form
      actions={
        <ActionPanel>
          <Action title="Lookup" icon={Icon.MagnifyingGlass} onAction={lookup} />
          {output && <Action title="Copy Output" icon={Icon.Clipboard} onAction={copy} />}
        </ActionPanel>
      }
    >
      <Form.TextField
        id="code"
        title="Code Point or Character"
        placeholder="1F600 or U+1F600 or 😀"
        value={code}
        onChange={setCode}
      />
      {output && <Form.TextArea id="output" title="Result" value={output} onChange={() => {}} />}
      {error && <Form.Description text={`⚠️ ${error}`} />}
    </Form>
  );
}
