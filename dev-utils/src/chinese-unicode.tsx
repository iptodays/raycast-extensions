import { useState, useCallback } from "react";
import { Form, ActionPanel, Action, Clipboard, showToast, Toast, Icon } from "@raycast/api";

export default function ChineseUnicode() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  const analyze = useCallback(() => {
    if (!input.trim()) return;
    const lines: string[] = [];
    for (const ch of input) {
      const cp = ch.codePointAt(0)!;
      const hex = cp.toString(16).toUpperCase().padStart(4, "0");
      const isCJK = cp >= 0x4e00 && cp <= 0x9fff;
      const utf8 = new TextEncoder().encode(ch);
      const utf8Hex = Array.from(utf8)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join(" ");
      lines.push(`${ch} → U+${hex} | UTF-8: ${utf8Hex} | ${isCJK ? "常用汉字" : "非CJK"}`);
    }
    setOutput(lines.join("\n"));
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
          <Action title="分析" icon={Icon.MagnifyingGlass} onAction={analyze} />
          {output && <Action title="Copy Output" icon={Icon.Clipboard} onAction={copy} />}
        </ActionPanel>
      }
    >
      <Form.TextArea id="input" title="文本" placeholder="输入中文文本…" value={input} onChange={setInput} />
      {output && <Form.TextArea id="output" title="编码分析" value={output} onChange={() => {}} />}
    </Form>
  );
}
