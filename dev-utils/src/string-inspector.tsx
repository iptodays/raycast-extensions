import { useState, useCallback } from "react";
import { Form, ActionPanel, Action, Clipboard, showToast, Toast, Icon } from "@raycast/api";

interface CharInfo {
  char: string;
  codePoint: number;
  hex: string;
  utf8: string;
  category: string;
}

function charCategory(cp: number): string {
  if (cp >= 0x41 && cp <= 0x5a) return "Uppercase Letter";
  if (cp >= 0x61 && cp <= 0x7a) return "Lowercase Letter";
  if (cp >= 0x30 && cp <= 0x39) return "Digit";
  if (cp <= 0x7e) return "Punctuation / Symbol";
  if (cp <= 0x7f) return "Control";
  if (cp <= 0xffff) return "BMP (Basic Multilingual Plane)";
  return "Supplementary Character";
}

function toUtf8Bytes(cp: number): string {
  if (cp <= 0x7f) return cp.toString(16).padStart(2, "0").toUpperCase();
  if (cp <= 0x7ff) {
    return (
      ((0xc0 | (cp >> 6)) & 0xff).toString(16).padStart(2, "0").toUpperCase() +
      " " +
      ((0x80 | (cp & 0x3f)) & 0xff).toString(16).padStart(2, "0").toUpperCase()
    );
  }
  if (cp <= 0xffff) {
    return (
      ((0xe0 | (cp >> 12)) & 0xff).toString(16).padStart(2, "0").toUpperCase() +
      " " +
      ((0x80 | ((cp >> 6) & 0x3f)) & 0xff).toString(16).padStart(2, "0").toUpperCase() +
      " " +
      ((0x80 | (cp & 0x3f)) & 0xff).toString(16).padStart(2, "0").toUpperCase()
    );
  }
  return (
    ((0xf0 | (cp >> 18)) & 0xff).toString(16).padStart(2, "0").toUpperCase() +
    " " +
    ((0x80 | ((cp >> 12) & 0x3f)) & 0xff).toString(16).padStart(2, "0").toUpperCase() +
    " " +
    ((0x80 | ((cp >> 6) & 0x3f)) & 0xff).toString(16).padStart(2, "0").toUpperCase() +
    " " +
    ((0x80 | (cp & 0x3f)) & 0xff).toString(16).padStart(2, "0").toUpperCase()
  );
}

function inspect(text: string): CharInfo[] {
  return [...text].map((char) => {
    const cp = char.codePointAt(0)!;
    return {
      char,
      codePoint: cp,
      hex: `U+${cp.toString(16).toUpperCase().padStart(4, "0")}`,
      utf8: toUtf8Bytes(cp),
      category: charCategory(cp),
    };
  });
}

export default function StringInspector() {
  const [input, setInput] = useState("");
  const [chars, setChars] = useState<CharInfo[]>([]);

  const analyze = useCallback(() => {
    if (!input.trim()) {
      setChars([]);
      return;
    }
    setChars(inspect(input));
  }, [input]);

  const copyAll = useCallback(async () => {
    if (!chars.length) return;
    const lines = chars.map(
      (c) => `'${c.char}' → Code: ${c.codePoint} | Hex: ${c.hex} | UTF-8: ${c.utf8} | ${c.category}`,
    );
    await Clipboard.copy(lines.join("\n"));
    showToast(Toast.Style.Success, "Copied to clipboard");
  }, [chars]);

  return (
    <Form
      actions={
        <ActionPanel>
          <Action title="Inspect" icon={Icon.MagnifyingGlass} onAction={analyze} />
          {chars.length > 0 && <Action title="Copy All" icon={Icon.Clipboard} onAction={copyAll} />}
        </ActionPanel>
      }
    >
      <Form.TextField
        id="input"
        title="Input"
        placeholder="Type or paste a string…"
        value={input}
        onChange={setInput}
      />
      {chars.length > 0 && (
        <>
          <Form.Separator />
          <Form.Description
            text={`Total: ${chars.length} character${chars.length > 1 ? "s" : ""} | Bytes: ${input.length}`}
          />
          {chars.map((c, i) => (
            <Form.Description
              key={i}
              text={`[${i}] '${c.char}' → U+${c.codePoint.toString(16).toUpperCase().padStart(4, "0")} | UTF-8: ${c.utf8}`}
            />
          ))}
        </>
      )}
    </Form>
  );
}
