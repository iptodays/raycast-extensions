import { useState, useCallback } from "react";
import { Form, ActionPanel, Action, Clipboard, showToast, Toast, Icon } from "@raycast/api";

interface Match {
  globalIndex: number;
  match: string;
  groups: { name: string; value: string }[];
  start: number;
  end: number;
}

function runRegex(
  pattern: string,
  flags: string,
  text: string,
): { matches: Match[]; error?: string; replaced?: string } {
  if (!pattern) return { matches: [] };

  try {
    const re = new RegExp(pattern, flags);
    const matches: Match[] = [];
    let idx = 0;

    const iter = text.matchAll(re);
    for (const m of iter) {
      const groups: { name: string; value: string }[] = [];
      if (m.groups) {
        for (const [k, v] of Object.entries(m.groups)) {
          groups.push({ name: k, value: v ?? "" });
        }
      }
      matches.push({
        globalIndex: idx++,
        match: m[0],
        groups,
        start: m.index ?? 0,
        end: (m.index ?? 0) + (m[0]?.length ?? 0),
      });
    }

    return { matches };
  } catch (e) {
    return { matches: [], error: (e as Error).message };
  }
}

export default function RegexPlayground() {
  const [pattern, setPattern] = useState("");
  const [flags, setFlags] = useState("g");
  const [text, setText] = useState("");
  const [replace, setReplace] = useState("");
  const [matches, setMatches] = useState<Match[]>([]);
  const [replaced, setReplaced] = useState("");
  const [error, setError] = useState("");
  const [highlighted, setHighlighted] = useState("");

  const test = useCallback(() => {
    if (!pattern) {
      setError("Enter a pattern");
      return;
    }
    const result = runRegex(pattern, flags, text);
    setMatches(result.matches);
    setError(result.error || "");
    setReplaced("");

    // Build highlighted text
    if (result.matches.length > 0 && !result.error) {
      let out = "";
      let pos = 0;
      for (const m of result.matches) {
        out += escapeHTML(text.slice(pos, m.start));
        out += `<mark>${escapeHTML(m.match)}</mark>`;
        pos = m.end;
      }
      out += escapeHTML(text.slice(pos));
      setHighlighted(out);
    } else {
      setHighlighted("");
    }
  }, [pattern, flags, text]);

  const doReplace = useCallback(() => {
    if (!pattern) {
      setError("Enter a pattern");
      return;
    }
    const result = runRegex(pattern, flags, text);
    setMatches(result.matches);
    setError(result.error || "");

    if (!result.error && replace) {
      try {
        const re = new RegExp(pattern, flags);
        const newText = text.replace(re, replace);
        setReplaced(newText);
      } catch {
        /* handled above */
      }
    }
  }, [pattern, flags, text, replace]);

  const copyMatches = useCallback(async () => {
    if (!matches.length) return;
    const lines = matches.map((m, i) => `[${i}] pos ${m.start}-${m.end}: "${m.match}"`);
    await Clipboard.copy(lines.join("\n"));
    showToast(Toast.Style.Success, "Copied to clipboard");
  }, [matches]);

  const copyReplaced = useCallback(async () => {
    if (!replaced) return;
    await Clipboard.copy(replaced);
    showToast(Toast.Style.Success, "Copied to clipboard");
  }, [replaced]);

  return (
    <Form
      actions={
        <ActionPanel>
          <ActionPanel.Section title="Actions">
            <Action title="Test" icon={Icon.MagnifyingGlass} onAction={test} />
            <Action title="Replace" icon={Icon.ArrowRight} onAction={doReplace} />
          </ActionPanel.Section>
          <ActionPanel.Section title="Copy">
            {matches.length > 0 && <Action title="Copy Matches" icon={Icon.Clipboard} onAction={copyMatches} />}
            {replaced && <Action title="Copy Replaced" icon={Icon.Clipboard} onAction={copyReplaced} />}
          </ActionPanel.Section>
        </ActionPanel>
      }
    >
      <Form.TextField
        id="pattern"
        title="Pattern"
        placeholder="\\b(\\w+)@(\\w+\\.\\w+)\\b"
        value={pattern}
        onChange={setPattern}
      />
      <Form.TextField id="flags" title="Flags" placeholder="g" value={flags} onChange={setFlags} />
      <Form.TextField id="replace" title="Replacement" placeholder="$1" value={replace} onChange={setReplace} />
      <Form.TextArea
        id="text"
        title="Test Text"
        placeholder="Text to search against…"
        value={text}
        onChange={setText}
      />

      {error && <Form.Description text={`⚠️ ${error}`} />}

      {matches.length > 0 && (
        <>
          <Form.Separator />
          <Form.Description text={`${matches.length} match${matches.length > 1 ? "es" : ""} found`} />
          {matches.map((m, i) => (
            <Form.Description
              key={i}
              title={`[${i}] pos ${m.start}-${m.end}`}
              text={m.match.length > 80 ? `${m.match.slice(0, 80)}…` : m.match}
            />
          ))}
        </>
      )}

      {replaced && (
        <>
          <Form.Separator />
          <Form.Description text="Replacement Result:" />
          <Form.TextArea id="replaced" title="Output" value={replaced} onChange={() => {}} />
        </>
      )}
    </Form>
  );
}

function escapeHTML(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
