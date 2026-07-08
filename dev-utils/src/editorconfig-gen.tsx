import { useState, useCallback } from "react";
import { Form, ActionPanel, Action, Clipboard, showToast, Toast, Icon } from "@raycast/api";

const TEMPLATES: { name: string; content: string }[] = [
  { name: "General", content: "root = true\n\n[*]\nindent_style = space\nindent_size = 2\nend_of_line = lf\ncharset = utf-8\ntrim_trailing_whitespace = true\ninsert_final_newline = true\n" },
  { name: "Python", content: "root = true\n\n[*]\nindent_style = space\nindent_size = 4\nend_of_line = lf\ncharset = utf-8\ntrim_trailing_whitespace = true\n\n[*.py]\nmax_line_length = 88\n" },
  { name: "JavaScript/TS", content: "root = true\n\n[*]\nindent_style = space\nindent_size = 2\nend_of_line = lf\ncharset = utf-8\ntrim_trailing_whitespace = true\n\n[*.{js,ts,jsx,tsx}]\nquote_type = single\n" },
  { name: "Go", content: "root = true\n\n[*]\nindent_style = tab\nindent_size = 4\nend_of_line = lf\ncharset = utf-8\ntrim_trailing_whitespace = true\n\n[*.go]\nindent_style = tab\n" },
  { name: "Rust", content: "root = true\n\n[*]\nindent_style = space\nindent_size = 4\nend_of_line = lf\ncharset = utf-8\ntrim_trailing_whitespace = true\n\n[*.rs]\nindent_size = 4\n" },
  { name: "YAML", content: "root = true\n\n[*.{yml,yaml}]\nindent_style = space\nindent_size = 2\nend_of_line = lf\n" },
  { name: "Makefile", content: "root = true\n\n[Makefile]\nindent_style = tab\n" },
];

export default function EditorconfigGen() {
  const [template, setTemplate] = useState("General");
  const [output, setOutput] = useState("");

  const generate = useCallback(() => {
    const t = TEMPLATES.find((t) => t.name === template);
    setOutput(t?.content || "");
  }, [template]);

  const copy = useCallback(async () => {
    if (!output) return;
    await Clipboard.copy(output);
    showToast(Toast.Style.Success, "Copied to clipboard");
  }, [output]);

  return (
    <Form
      actions={
        <ActionPanel>
          <Action title="Generate" icon={Icon.ArrowRight} onAction={generate} />
          {output && <Action title="Copy Output" icon={Icon.Clipboard} onAction={copy} />}
        </ActionPanel>
      }
    >
      <Form.Dropdown id="template" title="Template" value={template} onChange={setTemplate}>
        {TEMPLATES.map((t) => <Form.Dropdown.Item key={t.name} value={t.name} title={t.name} />)}
      </Form.Dropdown>
      {output && <Form.TextArea id="output" title=".editorconfig" value={output} onChange={() => {}} />}
    </Form>
  );
}
