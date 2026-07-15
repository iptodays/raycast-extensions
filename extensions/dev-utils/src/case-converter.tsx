import { useState, useCallback } from "react";
import { Form, ActionPanel, Action, showToast, Toast, Icon } from "@raycast/api";

type CaseType =
  "camel" | "pascal" | "snake" | "kebab" | "upper" | "lower" | "title" | "sentence" | "dot" | "constant" | "swap";

function toWords(text: string): string[] {
  return text
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    .trim()
    .split(/\s+/)
    .map((w) => w.toLowerCase());
}

function convert(text: string, type: CaseType): string {
  const words = toWords(text);
  if (!words.length || !text.trim()) return "";

  switch (type) {
    case "camel":
      return words.map((w, i) => (i === 0 ? w : w[0]!.toUpperCase() + w.slice(1))).join("");
    case "pascal":
      return words.map((w) => w[0]!.toUpperCase() + w.slice(1)).join("");
    case "snake":
      return words.join("_");
    case "kebab":
      return words.join("-");
    case "upper":
      return text.toUpperCase();
    case "lower":
      return text.toLowerCase();
    case "title":
      return words.map((w) => w[0]!.toUpperCase() + w.slice(1)).join(" ");
    case "sentence": {
      const s = words.join(" ");
      return s[0]!.toUpperCase() + s.slice(1);
    }
    case "dot":
      return words.join(".");
    case "constant":
      return words.map((w) => w.toUpperCase()).join("_");
    case "swap":
      return text.replace(/[a-zA-Z]/g, (c) => (c === c.toLowerCase() ? c.toUpperCase() : c.toLowerCase()));
  }
}

const CASE_LABELS: { value: CaseType; label: string }[] = [
  { value: "camel", label: "camelCase" },
  { value: "pascal", label: "PascalCase" },
  { value: "snake", label: "snake_case" },
  { value: "kebab", label: "kebab-case" },
  { value: "upper", label: "UPPER CASE" },
  { value: "lower", label: "lower case" },
  { value: "title", label: "Title Case" },
  { value: "sentence", label: "Sentence case" },
  { value: "dot", label: "dot.case" },
  { value: "constant", label: "CONSTANT_CASE" },
  { value: "swap", label: "sWAP cASE" },
];

export default function CaseConverter() {
  const [input, setInput] = useState("");
  const [results, setResults] = useState<{ label: string; value: string }[]>([]);

  const convertAll = useCallback(() => {
    if (!input.trim()) {
      showToast(Toast.Style.Failure, "Please enter text");
      return;
    }
    setResults(CASE_LABELS.map(({ value, label }) => ({ label, value: convert(input, value) })));
  }, [input]);

  return (
    <Form
      actions={
        <ActionPanel>
          <Action title="Convert All" icon={Icon.ArrowRight} onAction={convertAll} />
        </ActionPanel>
      }
    >
      <Form.TextArea
        id="input"
        title="Input"
        placeholder="Paste any text or identifier name…"
        value={input}
        onChange={setInput}
      />
      {results.map((r) => (
        <Form.TextField key={r.label} id={r.label} title={r.label} value={r.value} onChange={() => {}} />
      ))}
    </Form>
  );
}
