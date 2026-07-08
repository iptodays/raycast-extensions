import { useState, useCallback } from "react";
import { Form, ActionPanel, Action, Clipboard, showToast, Toast, Icon } from "@raycast/api";

interface Match {
  index: number;
  value: string;
}

function execRegex(pattern: string, flags: string, text: string): { matches: Match[]; error?: string } {
  try {
    const re = new RegExp(pattern, flags);
    const matches: Match[] = [];
    let m: RegExpExecArray | null;
    let i = 0;
    while ((m = re.exec(text)) !== null) {
      matches.push({ index: m.index, value: m[0] });
      if (m.index === re.lastIndex) re.lastIndex++;
      i++;
      if (i > 1000) break; // safety limit
    }
    return { matches };
  } catch (e) {
    return { matches: [], error: (e as Error).message };
  }
}

export default function RegexTester() {
  const [pattern, setPattern] = useState("");
  const [flags, setFlags] = useState("gm");
  const [text, setText] = useState("");
  const [matches, setMatches] = useState<Match[]>([]);
  const [error, setError] = useState("");

  const test = useCallback(() => {
    if (!pattern.trim()) {
      setError("Please enter a regex pattern");
      setMatches([]);
      return;
    }
    const result = execRegex(pattern, flags, text);
    setMatches(result.matches);
    setError(result.error || "");
  }, [pattern, flags, text]);

  const copy = useCallback(async (text: string) => {
    await Clipboard.copy(text);
    showToast(Toast.Style.Success, "Copied to clipboard");
  }, []);

  return (
    <Form
      actions={
        <ActionPanel>
          <Action title="Test Regex" icon={Icon.ArrowRight} onAction={test} />
          {matches.length > 0 && (
            <Action title="Copy Matches" icon={Icon.Clipboard} onAction={() => copy(matches.map((m) => m.value).join("\n"))} />
          )}
        </ActionPanel>
      }
    >
      <Form.TextField
        id="pattern"
        title="Pattern"
        placeholder="\\d{4}"
        value={pattern}
        onChange={setPattern}
      />
      <Form.TextField
        id="flags"
        title="Flags"
        placeholder="gm"
        value={flags}
        onChange={setFlags}
      />
      <Form.TextArea
        id="text"
        title="Test Text"
        placeholder="Text to search against…"
        value={text}
        onChange={setText}
      />
      {matches.length > 0 && (
        <>
          <Form.Separator />
          <Form.Description text={`${matches.length} match${matches.length > 1 ? "es" : ""} found`} />
          {matches.map((m, i) => (
            <Form.TextField
              key={i}
              id={`match-${i}`}
              title={`#${i + 1}  (pos ${m.index})`}
              value={m.value}
              onChange={() => {}}
            />
          ))}
        </>
      )}
      {error && <Form.Description text={`⚠️ ${error}`} />}
    </Form>
  );
}
