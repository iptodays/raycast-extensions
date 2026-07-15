import { useState, useCallback } from "react";
import { Form, ActionPanel, Action, Clipboard, showToast, Toast, Icon } from "@raycast/api";

function evaluate(expr: string): string {
  // Sanitize: only allow math characters
  const sanitized = expr.replace(/\s/g, "").replace(/[^0-9+\-*/.()%^,]/g, "");

  if (!sanitized) return "";

  // Replace ^ with ** for exponentiation
  const jsExpr = sanitized.replace(/\^/g, "**");

  try {
    const result = Function(`"use strict"; return (${jsExpr});`)();
    if (typeof result === "number") {
      if (Number.isInteger(result)) return String(result);
      return result.toFixed(10).replace(/\.?0+$/, "");
    }
    return String(result);
  } catch {
    return "Error";
  }
}

export default function MathEval() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const calculate = useCallback(() => {
    if (!input.trim()) {
      setError("Please enter an expression");
      return;
    }
    const result = evaluate(input);
    if (result === "Error") {
      setError("Invalid expression");
      setOutput("");
      return;
    }
    setError("");
    setOutput(`${input.trim()} = ${result}`);
  }, [input]);

  const copy = useCallback(async () => {
    if (!output) return;
    await Clipboard.copy(output.split(" = ")[1] || output);
    showToast(Toast.Style.Success, "Copied to clipboard");
  }, [output]);

  return (
    <Form
      actions={
        <ActionPanel>
          <Action title="Evaluate" icon={Icon.ArrowRight} onAction={calculate} />
          {output && <Action title="Copy Result" icon={Icon.Clipboard} onAction={copy} />}
        </ActionPanel>
      }
    >
      <Form.TextField id="input" title="Expression" placeholder="2 + 2 * (3^2 + 1)" value={input} onChange={setInput} />
      {output && <Form.TextField id="output" title="Result" value={output.split(" = ")[1]!} onChange={() => {}} />}
      {error && <Form.Description text={`⚠️ ${error}`} />}
    </Form>
  );
}
