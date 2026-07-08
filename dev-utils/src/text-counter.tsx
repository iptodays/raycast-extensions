import { useState, useCallback } from "react";
import { Form, ActionPanel, Action, Clipboard, showToast, Toast, Icon } from "@raycast/api";

interface Counts {
  characters: number;
  charactersNoSpaces: number;
  words: number;
  lines: number;
  paragraphs: number;
  bytes: number;
  readingTime: string;
}

function count(text: string): Counts {
  const trimmed = text.trimEnd();
  return {
    characters: [...trimmed].length,
    charactersNoSpaces: [...trimmed.replace(/\s/g, "")].length,
    words: trimmed ? trimmed.split(/\s+/).length : 0,
    lines: trimmed ? trimmed.split(/\n/).length : 0,
    paragraphs: trimmed ? trimmed.split(/\n\n+/).filter(Boolean).length : 0,
    bytes: new TextEncoder().encode(trimmed).length,
    readingTime: `${Math.max(1, Math.ceil([...trimmed].length / 500))} min`,
  };
}

export default function TextCounter() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<Counts | null>(null);

  const analyze = useCallback(() => {
    setResult(count(input));
  }, [input]);

  const copy = useCallback(async () => {
    if (!result) return;
    const lines = [
      `Characters: ${result.characters}`,
      `Characters (no spaces): ${result.charactersNoSpaces}`,
      `Words: ${result.words}`,
      `Lines: ${result.lines}`,
      `Paragraphs: ${result.paragraphs}`,
      `Bytes: ${result.bytes}`,
      `Reading Time: ${result.readingTime}`,
    ];
    await Clipboard.copy(lines.join("\n"));
    showToast(Toast.Style.Success, "Copied to clipboard");
  }, [result]);

  return (
    <Form
      actions={
        <ActionPanel>
          <Action title="Analyze" icon={Icon.ArrowRight} onAction={analyze} />
          {result && <Action title="Copy Results" icon={Icon.Clipboard} onAction={copy} />}
        </ActionPanel>
      }
    >
      <Form.TextArea
        id="input"
        title="Input"
        placeholder="Type or paste text here…"
        value={input}
        onChange={setInput}
      />
      {result && (
        <>
          <Form.Separator />
          <Form.Description text={`Characters: ${result.characters}`} />
          <Form.Description text={`Characters (no spaces): ${result.charactersNoSpaces}`} />
          <Form.Description text={`Words: ${result.words}`} />
          <Form.Description text={`Lines: ${result.lines}`} />
          <Form.Description text={`Paragraphs: ${result.paragraphs}`} />
          <Form.Description text={`Bytes: ${result.bytes}`} />
          <Form.Description text={`Reading Time: ${result.readingTime}`} />
        </>
      )}
    </Form>
  );
}
