import { useState, useCallback } from "react";
import { Form, ActionPanel, Action, Clipboard, showToast, Toast, Icon } from "@raycast/api";

function minifyJS(code: string): string {
  return code
    .replace(/\/\/.*$/gm, "")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\n\s*/g, " ")
    .replace(/\s{2,}/g, " ")
    .replace(/\s*([{}();,=+\-*/%!<>|&?:])\s*/g, "$1")
    .trim();
}

export default function JsMinifier() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const doMinify = useCallback(() => {
    if (!input.trim()) {
      setError("Please enter code to minify");
      return;
    }
    setError("");
    const minified = minifyJS(input);
    setOutput(minified);

    const origBytes = new TextEncoder().encode(input).length;
    const newBytes = new TextEncoder().encode(minified).length;
    const saved = origBytes - newBytes;
    showToast(Toast.Style.Success, `Minified: ${origBytes}B → ${newBytes}B (saved ${saved}B)`);
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
          <Action title="Minify" icon={Icon.ArrowRight} onAction={doMinify} />
          {output && <Action title="Copy Output" icon={Icon.Clipboard} onAction={copy} />}
        </ActionPanel>
      }
    >
      <Form.TextArea
        id="input"
        title="Input Code"
        placeholder="function hello() { … }"
        value={input}
        onChange={setInput}
      />
      {output && <Form.TextArea id="output" title="Minified" value={output} onChange={() => {}} />}
      {error && <Form.Description text={`⚠️ ${error}`} />}
    </Form>
  );
}
