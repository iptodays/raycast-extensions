import { useState, useCallback } from "react";
import { Form, ActionPanel, Action, Clipboard, showToast, Toast, Icon } from "@raycast/api";

export default function TextWrap() {
  const [input, setInput] = useState("");
  const [width, setWidth] = useState("80");
  const [output, setOutput] = useState("");

  const wrap = useCallback(() => {
    if (!input.trim()) { showToast(Toast.Style.Failure, "Please enter text"); return; }
    const w = parseInt(width, 10) || 80;
    const lines: string[] = [];
    for (const para of input.split("\n\n")) {
      const words = para.split(/\s+/).filter(Boolean);
      let line = "";
      for (const word of words) {
        if (!line) { line = word; continue; }
        if ((line + " " + word).length <= w) line += " " + word;
        else { lines.push(line); line = word; }
      }
      if (line) lines.push(line);
      lines.push("");
    }
    setOutput(lines.join("\n"));
  }, [input, width]);

  const justify = useCallback(() => {
    if (!input.trim()) { showToast(Toast.Style.Failure, "Please enter text"); return; }
    const w = parseInt(width, 10) || 80;
    const lines: string[] = [];
    for (const para of input.split("\n\n")) {
      const words = para.split(/\s+/).filter(Boolean);
      let lineWords: string[] = [];
      for (const word of words) {
        const testLine = [...lineWords, word].join(" ");
        if (testLine.length <= w) { lineWords.push(word); continue; }
        const spaces = lineWords.length > 1 ? w - lineWords.join("").length : 0;
        const gaps = lineWords.length - 1;
        if (gaps === 0) lines.push(lineWords[0]!);
        else {
          const per = Math.floor(spaces / gaps);
          const extra = spaces % gaps;
          let justified = "";
          for (let i = 0; i < lineWords.length; i++) {
            justified += lineWords[i];
            if (i < gaps) justified += " ".repeat(per + (i < extra ? 1 : 0));
          }
          lines.push(justified);
        }
        lineWords = [word];
      }
      if (lineWords.length) lines.push(lineWords.join(" "));
      lines.push("");
    }
    setOutput(lines.join("\n"));
  }, [input, width]);

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
            <Action title="Wrap" icon={Icon.ArrowRight} onAction={wrap} />
            <Action title="Justify" icon={Icon.ArrowRight} onAction={justify} />
          </ActionPanel.Section>
          {output && <Action title="Copy Output" icon={Icon.Clipboard} onAction={copy} />}
        </ActionPanel>
      }
    >
      <Form.TextField id="width" title="Line Width" placeholder="80" value={width} onChange={setWidth} />
      <Form.TextArea id="input" title="Text" placeholder="Paste long text here…" value={input} onChange={setInput} />
      {output && <Form.TextArea id="output" title="Output" value={output} onChange={() => {}} />}
    </Form>
  );
}
