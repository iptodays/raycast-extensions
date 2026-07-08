import { useState, useMemo } from "react";
import { Form, ActionPanel, Action, Clipboard, showToast, Toast, Icon } from "@raycast/api";

const ITEMS: { title: string; pattern: string; description: string }[] = [
  { title: "Any character", pattern: ".", description: "Matches any single character except newline" },
  { title: "Start of string", pattern: "^", description: "Anchors at the start of line" },
  { title: "End of string", pattern: "$", description: "Anchors at the end of line" },
  { title: "Zero or more", pattern: "*", description: "Preceding element zero or more times" },
  { title: "One or more", pattern: "+", description: "Preceding element one or more times" },
  { title: "Zero or one", pattern: "?", description: "Preceding element optional" },
  { title: "Character set", pattern: "[abc]", description: "Matches a, b, or c" },
  { title: "Negated set", pattern: "[^abc]", description: "Matches any char except a, b, c" },
  { title: "Range", pattern: "[a-z]", description: "Matches any lowercase letter" },
  { title: "Digit", pattern: "\\d", description: "Matches any digit [0-9]" },
  { title: "Word char", pattern: "\\w", description: "Matches word char [a-zA-Z0-9_]" },
  { title: "Whitespace", pattern: "\\s", description: "Matches whitespace [\\t\\n\\r ]" },
  { title: "Not a digit", pattern: "\\D", description: "Matches any non-digit" },
  { title: "Not a word char", pattern: "\\W", description: "Matches non-word char" },
  { title: "Not whitespace", pattern: "\\S", description: "Matches non-whitespace" },
  { title: "Word boundary", pattern: "\\b", description: "Boundary between word and non-word" },
  { title: "Non-word boundary", pattern: "\\B", description: "Not at word boundary" },
  { title: "Alternation", pattern: "|", description: "OR — match either expression" },
  { title: "Group", pattern: "(abc)", description: "Capture group" },
  { title: "Non-capturing group", pattern: "(?:abc)", description: "Group without capturing" },
  { title: "Lookahead", pattern: "(?=foo)", description: "Followed by foo" },
  { title: "Negative lookahead", pattern: "(?!foo)", description: "Not followed by foo" },
  { title: "Lookbehind", pattern: "(?<=foo)", description: "Preceded by foo" },
  { title: "Negative lookbehind", pattern: "(?<!foo)", description: "Not preceded by foo" },
  { title: "N times", pattern: "x{n}", description: "Exactly n occurrences" },
  { title: "n or more", pattern: "x{n,}", description: "n or more occurrences" },
  { title: "Between n and m", pattern: "x{n,m}", description: "Between n and m occurrences" },
  { title: "Lazy quantifier", pattern: "*?", description: "Match as few as possible" },
  { title: "Escaped char", pattern: "\\.", description: "Literal dot (backslash escapes)" },
  { title: "Tab", pattern: "\\t", description: "Tab character" },
  { title: "Newline", pattern: "\\n", description: "Newline character" },
  { title: "Carriage return", pattern: "\\r", description: "Carriage return" },
];

export default function RegexSyntaxRef() {
  const [search, setSearch] = useState("");

  const filtered = useMemo(
    () =>
      search.trim()
        ? ITEMS.filter(
            (i) =>
              i.title.toLowerCase().includes(search.toLowerCase()) ||
              i.pattern.toLowerCase().includes(search.toLowerCase()) ||
              i.description.toLowerCase().includes(search.toLowerCase())
          )
        : ITEMS,
    [search]
  );

  return (
    <Form
      actions={
        <ActionPanel>
          {filtered.length === 1 && (
            <Action
              title="Copy Pattern"
              icon={Icon.Clipboard}
              onAction={async () => {
                await Clipboard.copy(filtered[0]!.pattern);
                showToast(Toast.Style.Success, "Copied to clipboard");
              }}
            />
          )}
        </ActionPanel>
      }
    >
      <Form.TextField
        id="search"
        title="Search"
        placeholder="lookahead, group, quantifier…"
        value={search}
        onChange={setSearch}
      />
      {filtered.slice(0, 100).map((i) => (
        <Form.Description key={i.title} title={`${i.pattern}  —  ${i.title}`} text={i.description} />
      ))}
    </Form>
  );
}
