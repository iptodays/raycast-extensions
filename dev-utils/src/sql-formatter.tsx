import { useState, useCallback } from "react";
import { Form, ActionPanel, Action, Clipboard, showToast, Toast, Icon } from "@raycast/api";

function formatSQL(sql: string): string {
  // Normalize whitespace and uppercase keywords
  let s = sql
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b(SELECT|FROM|WHERE|AND|OR|NOT|IN|IS|NULL|INSERT|INTO|VALUES|UPDATE|SET|DELETE|CREATE|TABLE|ALTER|DROP|INDEX|VIEW|JOIN|LEFT|RIGHT|INNER|OUTER|CROSS|ON|ORDER|BY|ASC|DESC|GROUP|HAVING|LIMIT|OFFSET|AS|DISTINCT|ALL|UNION|CASE|WHEN|THEN|ELSE|END|LIKE|BETWEEN|EXISTS|PRIMARY|KEY|FOREIGN|REFERENCES|COUNT|SUM|AVG|MIN|MAX)\b/gi,
      (m) => m.toUpperCase()
    );

  // Line-break after major keywords
  s = s
    .replace(/\b(SELECT|INSERT INTO|UPDATE|DELETE FROM|CREATE TABLE|ALTER TABLE|DROP TABLE)\b/gi, "\n$1")
    .replace(/\b(FROM|WHERE|AND |OR |ORDER BY|GROUP BY|HAVING|LIMIT|OFFSET|SET|VALUES|ON|JOIN|LEFT JOIN|RIGHT JOIN|INNER JOIN|OUTER JOIN|CROSS JOIN)\b/gi, "\n  $1")
    .replace(/\b(UNION)\b/gi, "\n$1\n");

  return s
    .split("\n")
    .map((l) => l.trimEnd())
    .join("\n")
    .trim();
}

export default function SqlFormatter() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const format = useCallback(() => {
    if (!input.trim()) {
      setError("Please enter SQL");
      return;
    }
    setError("");
    setOutput(formatSQL(input));
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
          <Action title="Format SQL" icon={Icon.ArrowRight} onAction={format} />
          {output && <Action title="Copy Output" icon={Icon.Clipboard} onAction={copy} />}
        </ActionPanel>
      }
    >
      <Form.TextArea id="input" title="SQL" placeholder="SELECT * FROM users WHERE id = 1" value={input} onChange={setInput} />
      {output && <Form.TextArea id="output" title="Formatted" value={output} onChange={() => {}} />}
      {error && <Form.Description text={`⚠️ ${error}`} />}
    </Form>
  );
}
