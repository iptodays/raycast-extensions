import { useState, useCallback } from "react";
import { Form, ActionPanel, Action, Clipboard, showToast, Toast, Icon } from "@raycast/api";

interface Token {
  raw: string;
  kind: string;
  description: string;
}

function tokenize(pattern: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < pattern.length) {
    const ch = pattern[i]!;

    // Escaped characters
    if (ch === "\\") {
      i++;
      const ec = pattern[i] ?? "";
      const map: Record<string, string> = {
        d: "any digit (0-9)",
        D: "any non-digit",
        w: "any word character (a-z, A-Z, 0-9, _)",
        W: "any non-word character",
        s: "any whitespace (space, tab, newline)",
        S: "any non-whitespace",
        b: "word boundary",
        B: "non-word boundary",
        A: "start of string",
        Z: "end of string",
        t: "tab character",
        n: "newline character",
        r: "carriage return",
        "0": "null character",
        "1": "back-reference to group 1",
        "2": "back-reference to group 2",
        "3": "back-reference to group 3",
        k: "named back-reference",
        p: "Unicode property escape",
        P: "negated Unicode property",
      };
      tokens.push({ raw: `\\${ec}`, kind: "escape", description: map[ec] || `escaped '${ec}' literal` });
      i++;
      continue;
    }

    // Anchors
    if (ch === "^") {
      tokens.push({ raw: "^", kind: "anchor", description: "start of line / string" });
      i++;
      continue;
    }
    if (ch === "$") {
      tokens.push({ raw: "$", kind: "anchor", description: "end of line / string" });
      i++;
      continue;
    }

    // Character classes
    if (ch === "[") {
      i++;
      let raw = "[";
      let negated = false;
      if (pattern[i] === "^") { raw += "^"; negated = true; i++; }
      // collect until ]
      let inner = "";
      while (i < pattern.length && pattern[i] !== "]") {
        raw += pattern[i];
        inner += pattern[i];
        i++;
      }
      raw += "]";
      i++;
      const desc = negated
        ? `matches any character NOT in [${inner}]`
        : `matches any character in [${inner}]`;
      tokens.push({ raw, kind: "char-class", description: desc });
      continue;
    }

    // Groups
    if (ch === "(") {
      const start = i;
      i++;
      let kind = "group";
      let desc = "capture group";

      if (pattern[i] === "?") {
        i++;
        if (pattern[i] === ":") { kind = "non-capturing"; desc = "non-capturing group"; i++; }
        else if (pattern[i] === "=") { kind = "lookahead"; desc = "positive lookahead"; i++; }
        else if (pattern[i] === "!") { kind = "lookahead"; desc = "negative lookahead"; i++; }
        else if (pattern[i] === "<" && pattern[i + 1] === "=") { kind = "lookbehind"; desc = "positive lookbehind"; i += 2; }
        else if (pattern[i] === "<" && pattern[i + 1] === "!") { kind = "lookbehind"; desc = "negative lookbehind"; i += 2; }
        else if (pattern[i] === "<") {
          // named group
          kind = "named-group";
          let name = "";
          i++;
          while (i < pattern.length && pattern[i] !== ">") {
            name += pattern[i]!;
            i++;
          }
          i++; // skip >
          desc = `named group "${name}"`;
        }
      }

      tokens.push({ raw: pattern.slice(start, i), kind, description: desc });
      continue;
    }

    // Close group
    if (ch === ")") {
      tokens.push({ raw: ")", kind: "group-close", description: "close group" });
      i++;
      continue;
    }

    // Quantifiers
    if (ch === "*") {
      const raw = pattern[i + 1] === "?" ? (i++, "*?") : "*";
      tokens.push({ raw, kind: "quantifier", description: raw === "*?" ? "zero or more (lazy)" : "zero or more" });
      i++;
      continue;
    }
    if (ch === "+") {
      const raw = pattern[i + 1] === "?" ? (i++, "+?") : "+";
      tokens.push({ raw, kind: "quantifier", description: raw === "+?" ? "one or more (lazy)" : "one or more" });
      i++;
      continue;
    }
    if (ch === "?") {
      const raw = pattern[i + 1] === "?" ? (i++, "??") : "?";
      tokens.push({ raw, kind: "quantifier", description: raw === "??" ? "optional (lazy)" : "optional" });
      i++;
      continue;
    }
    if (ch === "{") {
      i++;
      let raw = "{";
      while (i < pattern.length && pattern[i] !== "}") {
        raw += pattern[i];
        i++;
      }
      raw += "}";
      i++;
      tokens.push({ raw, kind: "quantifier", description: `exactly/n/m occurrences ${raw}` });
      continue;
    }

    // Alternation
    if (ch === "|") {
      tokens.push({ raw: "|", kind: "alternation", description: "OR — match left or right side" });
      i++;
      continue;
    }

    // Wildcard
    if (ch === ".") {
      tokens.push({ raw: ".", kind: "wildcard", description: "any single character (except newline)" });
      i++;
      continue;
    }

    // Literal character
    tokens.push({ raw: ch, kind: "literal", description: `matches '${ch}' literally` });
    i++;
  }

  return tokens;
}

function buildLongDescription(tokens: Token[]): string {
  return tokens
    .map((t) => `\`${t.raw}\` — ${t.description}`)
    .join("\n");
}

export default function RegexExplainer() {
  const [pattern, setPattern] = useState("");
  const [flags, setFlags] = useState("g");
  const [tokens, setTokens] = useState<Token[]>([]);
  const [error, setError] = useState("");
  const [isValid, setIsValid] = useState(false);

  const explain = useCallback(() => {
    if (!pattern.trim()) {
      setError("Enter a regex pattern");
      setTokens([]);
      return;
    }
    try {
      new RegExp(pattern, flags);
      setIsValid(true);
    } catch (e) {
      setError(`Invalid regex: ${(e as Error).message}`);
      setIsValid(false);
      setTokens([]);
      return;
    }

    setError("");
    const result = tokenize(pattern);
    setTokens(result);
  }, [pattern, flags]);

  const copy = useCallback(async (text: string) => {
    await Clipboard.copy(text);
    showToast(Toast.Style.Success, "Copied to clipboard");
  }, []);

  return (
    <Form
      actions={
        <ActionPanel>
          <Action title="Explain" icon={Icon.MagnifyingGlass} onAction={explain} />
          {tokens.length > 0 && (
            <Action
              title="Copy Explanation"
              icon={Icon.Clipboard}
              onAction={() => copy(buildLongDescription(tokens))}
            />
          )}
        </ActionPanel>
      }
    >
      <Form.TextField id="pattern" title="Pattern" placeholder="^(\\d{4}-\\d{2}-\\d{2})$" value={pattern} onChange={setPattern} />
      <Form.TextField id="flags" title="Flags" placeholder="g" value={flags} onChange={setFlags} />

      {isValid && !error && (
        <Form.Description title="Status" text="Valid regex" />
      )}

      {tokens.length > 0 && (
        <>
          <Form.Separator />
          {tokens.map((t, i) => (
            <Form.Description
              key={i}
              title={`${i + 1}. \`${t.raw}\``}
              text={`${t.kind} — ${t.description}`}
            />
          ))}
        </>
      )}

      {error && <Form.Description text={`⚠️ ${error}`} />}
    </Form>
  );
}
